import { Controllable } from './Controllable'
import { IRelayCallingTapTap, IRelayCallingTapDevice } from '../interfaces'
import { Notification, TapState, Method } from '../constants'
import Call from '../Call'
import Event from '../Event'

export class Tap extends Controllable {
  public eventType: string = Notification.Tap
  public method: string = Method.Tap
  public controlId: string = this.controlId

  constructor(public call: Call, public tap: IRelayCallingTapTap, public device: IRelayCallingTapDevice) {
    super(call)
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

  get sourceDevice(): IRelayCallingTapDevice {
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

    this.completed = this.state === TapState.Finished
    if (this.completed) {
      this.successful = true
      this.event = new Event(this.state, params)
    }

    if (this._hasBlocker() && this._eventsToWait.includes(this.state)) {
      this.blocker.resolve()
    }
  }
}
