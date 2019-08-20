import Controllable from './Controllable'
import { ICallingPlay, ICallingCollect } from '../../../util/interfaces'
import { CallNotification, CallPromptState } from '../../../util/constants/relay'
import Call from '../Call'
import Event from '../Event'

export default class Prompt extends Controllable {
  public eventType: string = CallNotification.Collect
  public controlId: string = this.controlId

  public type: string
  public input: string
  public terminator: string
  public confidence: number

  constructor(
    public call: Call,
    public collect: ICallingCollect,
    public play: ICallingPlay[]
  ) {
    super(call)
  }

  get method(): string {
    return 'calling.play_and_collect'
  }

  get payload(): any {
    return {
      node_id: this.call.nodeId,
      call_id: this.call.id,
      control_id: this.controlId,
      play: this.play,
      collect: this.collect
    }
  }

  notificationHandler(params: any): void {
    this.completed = true
    const { result } = params

    this.type = result.type
    this.event = new Event(this.type, result)
    switch (this.type) {
      case CallPromptState.Digit:
        this.state = 'successful'
        this.successful = true
        this.input = result.params.digits
        this.terminator = result.params.terminator
        break
      case CallPromptState.Speech:
        this.state = 'successful'
        this.successful = true
        this.input = result.params.text
        this.confidence = result.params.confidence
        break
      default:
        this.state = this.type
        this.successful = false
    }

    if (this._hasBlocker() && this._eventsToWait.includes(this.type)) {
      this.blocker.resolve()
    }
  }
}
