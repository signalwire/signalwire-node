import Controllable from './Controllable'
import { ICallingPlay, ICallingCollect } from '../../../util/interfaces'
import { CallNotification } from '../../../util/constants/relay'
import Call from '../Call'

export default class Prompt extends Controllable {
  public eventType: string = CallNotification.Collect

  constructor(
    public call: Call,
    public collect: ICallingCollect,
    public play: ICallingPlay[]
  ) {
    super(call)
  }

  get method(): string {
    return 'call.play_and_collect'
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
    const { state } = params

    if (this._hasBlocker() && this._eventsToWait.includes(state)) {
      this.blocker.resolve()
    }
  }
}
