import { BaseComponent } from './BaseComponent'
import { ReferParams } from '../../../util/interfaces'
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
    public params: ReferParams,
  ) {
    super(call)
  }

  get payload(): any {
    const tmp: any = {
      node_id: this.call.nodeId,
      call_id: this.call.id,
      device: {
        type: 'sip',
        params: this.params
      }
    }
    return tmp
  }

  notificationHandler(params: any): void {
    this.state = params.state

    this.referTo = params.sip_refer_to
    this.referResponseCode = params.sip_refer_response_code
    this.referNotifyCode = params.sip_notify_response_code

    this.completed = this.state !== CallReferState.InProgress
    if (this.completed) {
      this.successful = this.state === CallReferState.Success
      this.event = new Event(this.state, params)
    }

    if (this._hasBlocker() && this._eventsToWait.includes(this.state)) {
      this.blocker.resolve()
    }
  }
}
