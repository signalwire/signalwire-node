import Controllable from './Controllable'
import { ICallingDetect } from '../../../util/interfaces'
import { CallNotification, CallDetectState } from '../../../util/constants/relay'
import Call from '../Call'
import Event from '../Event'

export default class Detect extends Controllable {
  public eventType: string = CallNotification.Detect
  public controlId: string = this.controlId

  public type: string
  public result: string

  protected _eventsToWait: string[] = [CallDetectState.Error, CallDetectState.Finished]

  private _events: string[] = []

  constructor(
    public call: Call,
    private _detect: ICallingDetect,
    private _timeout: number = null
  ) {
    super(call)
  }

  get method(): string {
    return 'calling.detect'
  }

  get payload(): any {
    const { params } = this._detect
    this._detect.params = params || {}
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
    if (event !== CallDetectState.Finished && event !== CallDetectState.Error) {
      this._events.push(event)
    }
    this.completed = this._eventsToWait.includes(this.state)
    if (this.completed) {
      this.successful = this.state !== CallDetectState.Error
      this.result = this._events.join('')
      this.event = new Event(this.state, detect)
      if (this._hasBlocker()) {
        this.blocker.resolve()
      }
    }
  }
}
