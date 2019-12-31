import { BaseComponent } from './BaseComponent'
import { DeepArray, IDevice, IRelayCallingPlay } from '../interfaces'
import { Notification, ConnectState, Method } from '../constants'
import Call from '../Call'
import Event from '../Event'

export class Connect extends BaseComponent {
  public eventType: string = Notification.Connect
  public method: string = Method.Connect
  public controlId: string = this.call.tag

  constructor(
    public call: Call,
    public devices: DeepArray<IDevice>,
    public ringback?: IRelayCallingPlay
  ) {
    super(call)
  }

  get payload(): any {
    const tmp: any = {
      node_id: this.call.nodeId,
      call_id: this.call.id,
      devices: this.devices
    }
    if (this.ringback) {
      tmp.ringback = this.ringback
    }
    return tmp
  }

  notificationHandler(params: any): void {
    this.state = params.connect_state

    this.completed = this.state !== ConnectState.Connecting
    if (this.completed) {
      this.successful = this.state === ConnectState.Connected
      this.event = new Event(this.state, params)
    }

    if (this._hasBlocker() && this._eventsToWait.includes(this.state)) {
      this.blocker.resolve()
    }
  }
}
