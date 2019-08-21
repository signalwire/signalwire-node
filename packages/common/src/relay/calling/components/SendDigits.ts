import BaseComponent from './BaseComponent'
import { CallNotification, SendDigitsState } from '../../../util/constants/relay'
import Call from '../Call'

export default class SendDigits extends BaseComponent {
  public eventType: string = CallNotification.SendDigits
  public controlId: string = this.controlId

  constructor(public call: Call, public digits: string) {
    super(call)
  }

  get method(): string {
    return 'calling.send_digits'
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
    if (this.completed) {
      this.successful = true
    }

    if (this._hasBlocker() && this._eventsToWait.includes(this.state)) {
      this.blocker.resolve()
    }
  }
}
