import BrowserSession from '../../common/src/BrowserSession'
import { SubscribeParams, BroadcastParams } from '../../common/src/util/interfaces'
import { CallOptions } from '../../common/src/webrtc/interfaces'
import { Login } from '../../common/src/messages/Verto'
import WebRTCCall from '../../common/src/webrtc/WebRTCCall'
import { SwEvent, SESSION_ID } from '../../common/src/util/constants'
import { trigger } from '../../common/src/services/Handler'
import { localStorage } from '../../common/src/util/storage/'
import VertoHandler from '../../common/src/webrtc/VertoHandler'
import BaseMessage from '../../common/src/messages/BaseMessage'

export const VERTO_PROTOCOL = 'verto-protocol'
export default class Verto extends BrowserSession {

  public relayProtocol: string = VERTO_PROTOCOL

  validateOptions() {
    const { host, login, passwd, password } = this.options
    return Boolean(host) && Boolean(login && (passwd || password))
  }

  newCall(options: CallOptions) {
    const { destinationNumber = null } = options
    if (!destinationNumber) {
      throw new Error('Verto.newCall() error: destinationNumber is required.')
    }
    const call = new WebRTCCall(this, options)
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

  _wrapInExecute(message: BaseMessage): BaseMessage {
    return message
  }

  protected async _onSocketOpen() {
    this._idle = false
    const { login, password, passwd, userVariables } = this.options
    if (this.sessionid) {
      const sessidLogin = new Login(undefined, undefined, this.sessionid, undefined)
      await this.execute(sessidLogin).catch(console.error)
    }
    const msg = new Login(login, (password || passwd), this.sessionid, userVariables)
    const response = await this.execute(msg).catch(this._handleLoginError)
    if (response) {
      this._autoReconnect = true
      this.sessionid = response.sessid
      localStorage.setItem(SESSION_ID, this.sessionid)
      trigger(SwEvent.Ready, this, this.uuid)
    }
  }

  protected _onSocketMessage(msg: any) {
    VertoHandler(this, msg)
  }
}
