import BaseComponent from './BaseComponent'
import { CallNotification, CallState } from '../../../util/constants/relay'
import Event from '../Event'

export default class Dial extends BaseComponent {
  public eventType: string = CallNotification.State
  public controlId: string = this.call.tag

  get method(): string {
    return 'call.begin'
  }

  get payload(): any {
    return {
      tag: this.call.tag,
      device: this.call.device
    }
  }

  notificationHandler(params: any): void {
    this.state = params.call_state

    const events: string[] = [CallState.Answered, CallState.Ending, CallState.Ended]
    this.completed = events.includes(this.state)
    if (this.completed) {
      this.successful = this.state === CallState.Answered
      this.event = new Event(this.state, params)
    }

    if (this._hasBlocker() && this._eventsToWait.includes(this.state)) {
      this.blocker.resolve()
    }
  }
}
