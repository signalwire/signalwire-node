import { BaseComponent } from './BaseComponent'
import { Notification, CallState, Method } from '../constants'
import Event from '../Event'

export class Dial extends BaseComponent {
  public eventType: string = Notification.State
  public method: string = Method.Dial
  public controlId: string = this.call.tag

  get payload(): any {
    return {
      tag: this.call.tag,
      devices: this.call.targets
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
