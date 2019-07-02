import Controllable from './Controllable'
import { ICallingPlay } from '../../../util/interfaces'
import { CallNotification, CallPlayState } from '../../../util/constants/relay'
import Call from '../Call'

export default class Play extends Controllable {
  public eventType: string = CallNotification.Play

  constructor(public call: Call, public play: ICallingPlay[]) {
    super(call)
  }

  get method(): string {
    return 'call.play'
  }

  get payload(): any {
    return {
      node_id: this.call.nodeId,
      call_id: this.call.id,
      control_id: this.controlId,
      play: this.play
    }
  }

  notificationHandler(params: any): void {
    this.state = params.state
    this.completed = params.state !== CallPlayState.Playing
    this.successful = params.state === CallPlayState.Finished

    if (this._hasBlocker() && this._eventsToWait.includes(this.state)) {
      this.blocker.resolve()
    }
  }
}
