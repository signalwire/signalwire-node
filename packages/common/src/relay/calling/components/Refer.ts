import { BaseComponent } from './BaseComponent'
import { CallingSipDevice } from '../../../util/interfaces'
import { CallNotification, CallReferState, CallMethod } from '../../../util/constants/relay'
import Call from '../Call'
import Event from '../Event'

export class Refer extends BaseComponent {
  public eventType: string = CallNotification.Refer
  public method: string = CallMethod.Refer
  public controlId: string = this.call.tag

  public referTo: string
  public referResponseCode: string
  public referNotifyCode: string

  constructor(
    public call: Call,
    public device: CallingSipDevice,
  ) {
    super(call)
  }

  get payload(): any {
    const tmp: any = {
      node_id: this.call.nodeId,
      call_id: this.call.id,
      device: this.device
    }
    return tmp
  }

  notificationHandler(params: any): void {
    this.state = params.state

    this.referTo = params.sip_refer_to
    this.referResponseCode = params.sip_refer_response_code
    this.referNotifyCode = params.sip_notify_response_code

    /**
     * FIXME: check for a specific sip_notify_response_code in here.
     */
    this.completed = this.state !== CallReferState.Finished
    if (this.completed) {
      // FIXME: check for a specific sip_notify_response_code in here.
      this.successful = params.sip_notify_response_code === '202'
      this.event = new Event(this.state, params)
    }

    if (this._hasBlocker() && this._eventsToWait.includes(this.state)) {
      this.blocker.resolve()
    }
  }
}
