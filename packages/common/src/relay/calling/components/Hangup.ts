import BaseComponent from './BaseComponent'
import { CallNotification, CallState } from '../../../util/constants/relay'
import Call from '../Call'

export default class Hangup extends BaseComponent {
  public eventType: string = CallNotification.State
  public controlId: string = this.call.tag

  constructor(public call: Call, public reason: string) {
    super(call)
  }

  get method(): string {
    return 'call.end'
  }

  get payload(): any {
    return {
      node_id: this.call.nodeId,
      call_id: this.call.id,
      reason: this.reason
    }
  }

  notificationHandler(params: any): void {
    const { call_state, reason } = params
    if (call_state === CallState.Ended) {
      this.reason = reason
      this.completed = true
      this.result = params
    }

    if (this._hasBlocker() && this._eventsToWait.includes(call_state)) {
      this.reason = reason
      this.blocker.resolve()
    }
  }
}
