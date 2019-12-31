import { BaseComponent } from './BaseComponent'
import { Notification, CallState, Method } from '../constants'
import Event from '../Event'

export class Answer extends BaseComponent {
  public eventType: string = Notification.State
  public method: string = Method.Answer
  public controlId: string = this.call.tag

  get payload(): any {
    return {
      node_id: this.call.nodeId,
      call_id: this.call.id
    }
  }

  notificationHandler(params: any): void {
    const { call_state } = params
    if (call_state === CallState.Answered) {
      this.completed = true
      this.successful = true
      this.event = new Event(call_state, params)
    }

    if (this._hasBlocker() && this._eventsToWait.includes(call_state)) {
      this.blocker.resolve()
    }
  }
}
