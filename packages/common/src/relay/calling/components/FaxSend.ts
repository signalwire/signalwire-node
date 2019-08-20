import Call from '../Call'
import BaseFax from './BaseFax'

export default class FaxSend extends BaseFax {

  constructor(
    public call: Call,
    private _document: string,
    private _identity: string = null,
    private _header: string = null
  ) {
    super(call)
  }

  get method(): string {
    return 'calling.send_fax'
  }

  get payload(): any {
    const payload: any = {
      node_id: this.call.nodeId,
      call_id: this.call.id,
      control_id: this.controlId,
      document: this._document
    }
    if (this._identity) {
      payload.identity = this._identity
    }
    if (this._header) {
      payload.header_info = this._header
    }
    return payload
  }
}
