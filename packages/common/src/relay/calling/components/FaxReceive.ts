import BaseFax from './BaseFax'

export default class FaxReceive extends BaseFax {

  get method(): string {
    return 'call.receive_fax'
  }

  get payload(): any {
    return {
      node_id: this.call.nodeId,
      call_id: this.call.id,
      control_id: this.controlId
    }
  }
}
