import BrowserSession from '../../common/src/BrowserSession'
import WebRTC from '../../common/src/relay/webrtc/WebRTC'
import { DialogOptions } from '../../common/src/util/interfaces'
import logger from '../../common/src/util/logger'
import BaseMessage from '../../common/src/messages/BaseMessage'
import { Execute } from '../../common/src/messages/Blade'
import BaseRequest from '../../common/src/messages/verto/BaseRequest'

export default class SignalWire extends BrowserSession {
  protected _jwtAuth: boolean = true

  execute(message: BaseMessage) {
    let msg: BaseMessage = message
    if (message instanceof BaseRequest) {
      const params: { message: any, node_id?: string } = { message: message.request }
      if (message.targetNodeId) {
        params.node_id = message.targetNodeId
      }
      msg = new Execute({ protocol: this.webRtcProtocol, method: 'message', params })
    }
    return super.execute(msg)
  }

  async newCall(options: DialogOptions) {
    const dialog = await this._relayInstances['webrtc'].newCall(options)
      .catch(error => {
        logger.error('SignalWire newCall error', error)
      })
    return dialog
  }

  protected _onSessionConnect() {
    this._addRelayInstance('webrtc', WebRTC)
  }

  get webRtcProtocol() {
    return this._relayInstances['webrtc'] ? this._relayInstances['webrtc'].protocol : null
  }
}
