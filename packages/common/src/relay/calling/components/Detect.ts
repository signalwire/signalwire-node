import Controllable from './Controllable'
import { ICallingDetect } from '../../../util/interfaces'
import { CallNotification, CallDetectState } from '../../../util/constants/relay'
import Call from '../Call'
import Event from '../Event'

export default class Prompt extends Controllable {
  public eventType: string = CallNotification.Detect
  public controlId: string = this.controlId

  public type: string
  public result: string

  private _events: string[]

  constructor(
    public call: Call,
    private _detect: ICallingDetect,
    private _timeout: number = null
  ) {
    super(call)
  }

  get method(): string {
    return 'call.detect'
  }

  get payload(): any {
    const payload: any = {
      node_id: this.call.nodeId,
      call_id: this.call.id,
      control_id: this.controlId,
      detect: this._detect
    }
    if (this._timeout) {
      payload.timeout = this._timeout
    }
    return payload
  }

  notificationHandler(params: any): void {
    const { detect } = params
    const { type, params: { event } } = detect

    this.type = type
    this.state = event
    this.completed = [CallDetectState.Finished, CallDetectState.Error].includes(event)
    if (this.completed) {
      this.successful = type
      this.result = this._events.join('')
      this.event = new Event(this.state, detect)
    } else {
      this._events.push(event)
    }

    if (this._hasBlocker() && this._eventsToWait.includes(this.state)) {
      this.blocker.resolve()
    }
  }
}
