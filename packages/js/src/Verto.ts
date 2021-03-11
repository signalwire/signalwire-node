import logger from '../../common/src/util/logger'
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
    call.invite()
    return call
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

  async vertoLogin() {
    const { login, password, passwd, userVariables, loginParams } = this.options
    const msg = new Login({
      login,
      passwd: (password || passwd),
      sessionid: this.sessionid,
      userVariables,
      loginParams,
    })
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
    const response = await this.vertoLogin()
    if (response) {
      trigger(SwEvent.Ready, this, this.uuid)
    }
  }

  protected _onSocketMessage(msg: any) {
    VertoHandler(this, msg)
  }
}
