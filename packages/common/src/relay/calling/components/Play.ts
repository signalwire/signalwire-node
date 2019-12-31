import { Controllable } from './Controllable'
import { IRelayCallingPlay } from '../interfaces'
import { Notification, PlayState, Method } from '../constants'
import Call from '../Call'
import Event from '../Event'

export class Play extends Controllable {
  public eventType: string = Notification.Play
  public method: string = Method.Play
  public controlId: string = this.controlId

  constructor(public call: Call, public play: IRelayCallingPlay[], public volumeValue: number = 0) {
    super(call)
  }

  get payload(): any {
    const tmp: any = {
      node_id: this.call.nodeId,
      call_id: this.call.id,
      control_id: this.controlId,
      play: this.play
    }
    if (this.volumeValue != 0) {
      tmp.volume = +this.volumeValue
    }
    return tmp
  }

  notificationHandler(params: any): void {
    this.state = params.state

    this.completed = this.state !== PlayState.Playing
    if (this.completed) {
      this.successful = this.state === PlayState.Finished
      this.event = new Event(this.state, params)
    }

    if (this._hasBlocker() && this._eventsToWait.includes(this.state)) {
      this.blocker.resolve()
    }
  }
}
