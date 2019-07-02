import BaseComponent from './BaseComponent'
import { CallNotification, CallState } from '../../../util/constants/relay'

export default class Answer extends BaseComponent {
  public eventType: string = CallNotification.State
  public controlId: string = this.call.tag

  get method(): string {
    return 'call.answer'
  }

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
    }

    if (this._hasBlocker() && this._eventsToWait.includes(call_state)) {
      this.blocker.resolve()
    }
  }
}
