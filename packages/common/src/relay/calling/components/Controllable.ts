import BaseComponent from './BaseComponent'
import { Execute } from '../../../messages/Blade'

export default abstract class Controllable extends BaseComponent {

  stop() {
    const msg = new Execute({
      protocol: this.call.relayInstance.protocol,
      method: `${this.method}.stop`,
      params: {
        node_id: this.call.nodeId,
        call_id: this.call.id,
        control_id: this.controlId
      }
    })

    return this.call._execute(msg)
  }
}
