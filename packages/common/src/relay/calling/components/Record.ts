import Controllable from './Controllable'
import { CallNotification, CallRecordState } from '../../../util/constants/relay'
import Call from '../Call'

export default class Record extends Controllable {
  public eventType: string = CallNotification.Record

  constructor(public call: Call, public record: any) {
    super(call)
  }

  get method(): string {
    return 'call.record'
  }

  get payload(): any {
    return {
      node_id: this.call.nodeId,
      call_id: this.call.id,
      control_id: this.controlId,
      record: this.record
    }
  }

  notificationHandler(params: any): void {
    this.state = params.state

    if (this.state !== CallRecordState.Recording) {
      this.completed = true
      // TODO:
      // this.result = new RecordResult(params)
    }

    if (this._hasBlocker() && this._eventsToWait.includes(this.state)) {
      this.blocker.resolve()
    }
  }
}
