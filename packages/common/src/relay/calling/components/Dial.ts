import BaseComponent from './BaseComponent'
import { CallNotification } from '../../../util/constants/relay'

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
    const { call_state } = params

    this.result = params

    if (this._hasBlocker() && this._eventsToWait.includes(call_state)) {
      this.blocker.resolve()
    }
  }
}
