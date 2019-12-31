import { Controllable } from './Controllable'
import { Notification, RecordState, Method } from '../constants'
import Call from '../Call'
import Event from '../Event'
import { IRelayCallingRecord } from '../interfaces'

export class Record extends Controllable {
  public eventType: string = Notification.Record
  public method: string = Method.Record
  public controlId: string = this.controlId

  public url: string
  public duration: number
  public size: number

  constructor(public call: Call, public record: IRelayCallingRecord) {
    super(call)
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
    const { state, url, duration, size } = params
    this.state = state

    this.completed = this.state !== RecordState.Recording
    if (this.completed) {
      this.successful = this.state === RecordState.Finished
      this.event = new Event(this.state, params)
      this.url = url
      this.duration = duration
      this.size = size
    }

    if (this._hasBlocker() && this._eventsToWait.includes(this.state)) {
      this.blocker.resolve()
    }
  }
}
