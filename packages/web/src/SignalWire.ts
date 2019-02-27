import BrowserSession from './BrowserSession'
import WebRTC from '../../common/src/relay/webrtc/WebRTC'
import { DialogOptions } from '../../common/src/util/interfaces'
import logger from '../../common/src/util/logger'
import { Execute } from '../../common/src/messages/Blade'
import BaseRequest from '../../common/src/messages/verto/BaseRequest'
import { Login } from '../../common/src/messages/Verto'

export default class SignalWire extends BrowserSession {
  private _webrtcInstance: WebRTC = null

  protected async _onDisconnect() {
    // TODO: sent unsubscribe for all subscriptions?
  }

  execute(message: any) {
    let msg: any = message
    if (message instanceof BaseRequest) {
      msg = new Execute({ protocol: this._webrtcInstance.protocol, method: 'message', params: { message: message.request } })
    }
    return super.execute(msg)
  }

  _test() {
    if (this._webrtcInstance === null) {
      this._webrtcInstance = new WebRTC(this)
    }
  }

  async newCall(options: DialogOptions) {
    this._test()

    const dialog = await this._webrtcInstance.makeCall(options)
      .catch(error => {
        logger.error('SignalWire newCall error', error)
      })
    return dialog
  }
}
