import { Controllable } from './Controllable'
import { IRelayCallingPlay } from '../../../util/interfaces'
import { CallNotification, CallPlayState } from '../../../util/constants/relay'
import Call from '../Call'
import Event from '../Event'

export class Play extends Controllable {
  public eventType: string = CallNotification.Play
  public controlId: string = this.controlId

  constructor(public call: Call, public play: IRelayCallingPlay[]) {
    super(call)
  }

  get method(): string {
    return 'calling.play'
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

    this.completed = this.state !== CallPlayState.Playing
    if (this.completed) {
      this.successful = this.state === CallPlayState.Finished
      this.event = new Event(this.state, params)
    }

    if (this._hasBlocker() && this._eventsToWait.includes(this.state)) {
      this.blocker.resolve()
    }
  }
}
