import { BaseComponent } from './BaseComponent'
import { Notification, SendDigitsState, Method } from '../constants'
import Call from '../Call'
import Event from '../Event'

export class SendDigits extends BaseComponent {
  public eventType: string = Notification.SendDigits
  public method: string = Method.SendDigits
  public controlId: string = this.controlId

  constructor(public call: Call, public digits: string) {
    super(call)
  }

  get payload(): any {
    return {
      node_id: this.call.nodeId,
      call_id: this.call.id,
      control_id: this.controlId,
      digits: this.digits
    }
  }

  notificationHandler(params: any): void {
    this.state = params.state

    this.completed = this.state === SendDigitsState.Finished
    this.successful = this.completed
    this.event = new Event(this.state, params)

    if (this._hasBlocker() && this._eventsToWait.includes(this.state)) {
      this.blocker.resolve()
    }
  }
}
