import { BaseFax } from './BaseFax'
import { Method } from '../constants'

export class FaxReceive extends BaseFax {
  public method: string = Method.ReceiveFax

  get payload(): any {
    return {
      node_id: this.call.nodeId,
      call_id: this.call.id,
      control_id: this.controlId
    }
  }
}
