import { BaseComponent } from './BaseComponent'
import { CallNotification, CallMethod, DialState } from '../../../util/constants/relay'
import Event from '../Event'
import { DialPayload } from '../../../util/interfaces'
export class Dial extends BaseComponent {
  public eventType: string = CallNotification.Dial
  public method: string = CallMethod.Dial
  public controlId: string = this.call.tag

  get payload(): any {
    const payload: DialPayload = {
      tag: this.call.tag,
      devices: this.call.devices ?? [[this.call.device]]
    }
    if (this.call.region) {
      payload.region = this.call.region
    }
    return payload
  }

  notificationHandler(params: any): void {
    const { dial_state, call } = params
    this.state = dial_state
    this.completed = this._eventsToWait.includes(this.state)
    if (this.completed) {
      this.successful = this.state === DialState.Answered
      this.event = new Event(this.state, params)
    }

    if (this.successful && this.call.isMultiDial) {
      const multiDialCall = this.call
      this.call = this.call.relayInstance.getCallById(call.call_id)
      this.call.relayInstance.removeCall(multiDialCall)
    }

    if (this._hasBlocker() && this.completed) {
      this.blocker.resolve()
    }
  }
}
