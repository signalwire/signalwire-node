import BrowserSession from '../../common/src/BrowserSession'
import BaseMessage from '../../common/src/messages/BaseMessage'
import { Execute } from '../../common/src/messages/Blade'
import BaseRequest from '../../common/src/messages/verto/BaseRequest'
import { CallOptions } from '../../common/src/util/interfaces'
import Call from '../../common/src/webrtc/Call'

export default class SignalWire extends BrowserSession {
  execute(message: BaseMessage) {
    let msg: BaseMessage = message
    if (message instanceof BaseRequest) {
      const params: { message: any, node_id?: string } = { message: message.request }
      if (message.targetNodeId) {
        params.node_id = message.targetNodeId
      }
      msg = new Execute({ protocol: this.relayProtocol, method: 'message', params })
    }
    return super.execute(msg)
  }

  async newCall(options: CallOptions) {
    const { destinationNumber = null } = options
    if (!destinationNumber) {
      throw new TypeError('destinationNumber is required')
    }
    const call = new Call(this, options)
    call.invite()
    return call
  }
}
