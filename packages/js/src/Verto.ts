import BrowserSession from '../../common/src/BrowserSession'
import { SubscribeParams, BroadcastParams } from '../../common/src/util/interfaces'
import { CallOptions } from '../../common/src/webrtc/interfaces'
import { Login, Ping } from '../../common/src/messages/Verto'
import Call from '../../common/src/webrtc/Call'
import { SwEvent, SESSION_ID, VERTO_PROTOCOL } from '../../common/src/util/constants'
import { trigger } from '../../common/src/services/Handler'
import { localStorage } from '../../common/src/util/storage/'
import VertoHandler from '../../common/src/webrtc/VertoHandler'
import BaseMessage from '../../common/src/messages/BaseMessage'
import { Notification } from '../../common/src/webrtc/constants'
import logger from '../../common/src/util/logger'
import { sdkTimer } from '../../common/src/util/helpers'

export default class Verto extends BrowserSession {

  public relayProtocol: string = VERTO_PROTOCOL
  public timeoutErrorCode = -329990 // fake verto timeout error code.
  public loginResponse: any = {}
  public moderator = false
  public superuser = false

  validateOptions() {
    const { host, login, passwd, password } = this.options
    return Boolean(host) && Boolean(login && (passwd || password))
  }

  newCall(options: CallOptions) {
    const { destinationNumber = null } = options
    if (!destinationNumber) {
      throw new Error('Verto.newCall() error: destinationNumber is required.')
    }
    const call = new Call(this, options)
    return call.invite()
  }

  broadcast(params: BroadcastParams) {
    return this.vertoBroadcast(params)
  }

  subscribe(params: SubscribeParams) {
    return this.vertoSubscribe(params)
  }

  unsubscribe(params: SubscribeParams) {
    return this.vertoUnsubscribe(params)
  }

  ping() {
    const msg = new Ping({ serno: Date.now() })
    return this.execute(msg)
  }

  _wrapInExecute(message: BaseMessage): BaseMessage {
    return message
  }

  get vertoLoginResume() {
    const callIds = this.callIds
    return callIds.length && callIds.some(callId => {
      return this.calls[callId]?.peer?.needResume
    })
  }

  async vertoLogin() {
    const { login, password, passwd, userVariables, loginParams } = this.options
    const msg = new Login({
      login,
      passwd: (password || passwd),
      sessionid: this.sessionid,
      userVariables,
      loginParams,
      callIds: this._experimental ? this.callIds : [],
      resume: this.vertoLoginResume,
    })
    const clientReadyHandler = (params: any) => {
      if (params.type === Notification.VertoClientReady) {
        this.off(SwEvent.Notification, clientReadyHandler)

        const { reattached_sessions = [] } = params
        if (reattached_sessions?.length) {
          logger.debug('FS clientReady', params)
          reattached_sessions.forEach(async (callId: string) => {
            const call = this.calls[callId]
            if (call) {
              await call.resume()
            }
          })
        }
      }
    }
    this.on(SwEvent.Notification, clientReadyHandler)

    const response = await this.execute(msg).catch(this._handleLoginError)
    if (response) {
      this._autoReconnect = true
      this._idle = false
      this.loginResponse = response
      this.moderator = response.moderator || false
      this.superuser = response.superuser || false
      this.sessionid = response.sessid
      /**
       * Enable mod_verto with token auth
       */
      if (response['auth-expires']) {
        this.authorization = {
          expires_at: response['auth-expires'],
          signature: null,
          project: null,
          scope_id: null,
          scopes: [],
          resource: null,
        }
        this._checkTokenExpiration()
      }
      if (!this.incognito) {
        localStorage.setItem(SESSION_ID, this.sessionid)
      }
    }

    return response
  }

  protected async _onSocketOpen() {
    this._idle = false
    const timer = sdkTimer('cantina:vertoLogin')
    timer.start()
    const response = await this.vertoLogin()
    timer.stop()
    if (response) {
      trigger(SwEvent.Ready, this, this.uuid)
    }
  }

  protected _onSocketMessage(msg: any) {
    VertoHandler(this, msg)
  }
}
