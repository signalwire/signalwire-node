import Controllable from './Controllable'
import { ICallingTapTap, ICallingTapDevice } from '../../../util/interfaces'
import { CallNotification, CallTapState } from '../../../util/constants/relay'
import Call from '../Call'
import Event from '../Event'

export default class Tap extends Controllable {
  public eventType: string = CallNotification.Tap
  public controlId: string = this.controlId

  constructor(public call: Call, public tap: ICallingTapTap, public device: ICallingTapDevice) {
    super(call)
  }

  get method(): string {
    return 'calling.tap'
  }

  get payload(): any {
    return {
      node_id: this.call.nodeId,
      call_id: this.call.id,
      control_id: this.controlId,
      tap: this.tap,
      device: this.device
    }
  }

  get sourceDevice(): ICallingTapDevice {
    if (!this._executeResult) {
      return null
    }
    const { source_device = null } = this._executeResult
    return source_device
  }

  notificationHandler(params: any): void {
    const { state, tap, device } = params
    this.tap = tap
    this.device = device
    this.state = state

    this.completed = this.state === CallTapState.Finished
    if (this.completed) {
      this.successful = true
      this.event = new Event(this.state, params)
    }

    if (this._hasBlocker() && this._eventsToWait.includes(this.state)) {
      this.blocker.resolve()
    }
  }
}
