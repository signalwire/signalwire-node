import Controllable from './Controllable'
import { DeepArray, ICallDevice } from '../../../util/interfaces'
import { CallNotification } from '../../../util/constants/relay'
import Call from '../Call'

export default class Connect extends Controllable {
  public eventType: string = CallNotification.Connect

  constructor(public call: Call, public devices: DeepArray<ICallDevice>) {
    super(call)
  }

  get method(): string {
    return 'call.connect'
  }

  get payload(): any {
    return {
      node_id: this.call.nodeId,
      call_id: this.call.id,
      devices: this.devices
    }
  }

  notificationHandler(params: any): void {
    const { connect_state } = params

    if (this._hasBlocker() && this._eventsToWait.includes(connect_state)) {
      this.blocker.resolve()
    }
  }
}
