import BrowserSession from '../../common/src/BrowserSession'
import BaseMessage from '../../common/src/messages/BaseMessage'
import { Execute } from '../../common/src/messages/Blade'
import BaseRequest from '../../common/src/messages/verto/BaseRequest'

export default class Relay extends BrowserSession {
  protected _jwtAuth: boolean = true

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
}
