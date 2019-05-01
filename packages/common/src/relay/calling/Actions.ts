import { Execute } from '../../messages/Blade'
import Call from './Call'

abstract class BaseAction {

  protected abstract baseMethod: string

  constructor(public call: Call, protected controlId: string) {}

  stop() {
    const msg = new Execute({
      protocol: this.call.relayInstance.protocol,
      method: `${this.baseMethod}.stop`,
      params: {
        node_id: this.call.nodeId,
        call_id: this.call.id,
        control_id: this.controlId
      }
    })

    return this.call._execute(msg)
  }
}

class PlayAction extends BaseAction {
  protected baseMethod = 'call.play'
}

class PlayMediaAction extends PlayAction {}
class PlayAudioAction extends PlayAction {}
class PlaySilenceAction extends PlayAction {}
class PlayTTSAction extends PlayAction {}

export {
  PlayMediaAction,
  PlayAudioAction,
  PlaySilenceAction,
  PlayTTSAction
}
