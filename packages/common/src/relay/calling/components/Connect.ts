import Controllable from './Controllable'
import { DeepArray, ICallDevice } from '../../../util/interfaces'
import { CallNotification, CallConnectState } from '../../../util/constants/relay'
import Call from '../Call'

export default class Connect extends Controllable {
  public eventType: string = CallNotification.Connect
  public controlId: string = this.call.tag

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
    this.state = params.connect_state
    this.completed = this.state !== CallConnectState.Connecting
    this.successful = this.state === CallConnectState.Connected
    this.result = this.call.peer

    if (this._hasBlocker() && this._eventsToWait.includes(this.state)) {
      this.blocker.resolve()
    }
  }
}
