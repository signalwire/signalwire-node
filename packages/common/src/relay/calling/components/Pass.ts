import { BaseComponent } from './BaseComponent'
import { CallNotification, CallMethod } from '../../../util/constants/relay'

export class Pass extends BaseComponent {
  public eventType: string = CallNotification.State
  public method: string = CallMethod.Pass

  get payload(): any {
    return {
      node_id: this.call.nodeId,
      call_id: this.call.id
    }
  }

  notificationHandler(params: any): void {}
}
