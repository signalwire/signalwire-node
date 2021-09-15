import { BaseComponent } from './BaseComponent'
import { CallNotification, CallMethod, DialState } from '../../../util/constants/relay'
import Event from '../Event'

export class Dial extends BaseComponent {
  public eventType: string = CallNotification.Dial
  public method: string = CallMethod.Dial
  public controlId: string = this.call.tag

  get payload(): any {
    return {
      tag: this.call.tag,
      devices: this.call.devices ?? [[this.call.device]]
    }
  }

  notificationHandler(params: any): void {
    const { dial_state, call } = params
    this.state = dial_state
    this.completed = this._eventsToWait.includes(this.state)
    if (this.completed) {
      this.successful = this.state === DialState.Answered
      this.event = new Event(this.state, params)
    }

    if (this.successful && call?.call_id) {
      this.call = this.call.relayInstance.getCallById(call.call_id)
    }

    if (this._hasBlocker() && this._eventsToWait.includes(this.state)) {
      this.blocker.resolve()
    }
  }
}
