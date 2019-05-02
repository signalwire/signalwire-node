import { Execute } from '../../messages/Blade'
import Call from './Call'

abstract class BaseAction {

  protected abstract baseMethod: string

  constructor(public call: Call, protected controlId: string) {
    if (!controlId) {
      throw new Error('Missing control_id')
    }
  }

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

class RecordAction extends BaseAction {
  protected baseMethod = 'call.record'
}

class PlayAction extends BaseAction {
  protected baseMethod = 'call.play'
}

class PlayMediaAction extends PlayAction {}
class PlayAudioAction extends PlayAction {}
class PlaySilenceAction extends PlayAction {}
class PlayTTSAction extends PlayAction {}

class PlayAndCollectAction extends BaseAction {
  protected baseMethod = 'call.play_and_collect'
}

class PlayMediaAndCollectAction extends PlayAndCollectAction {}
class PlayAudioAndCollectAction extends PlayAndCollectAction {}
class PlaySilenceAndCollectAction extends PlayAndCollectAction {}
class PlayTTSAndCollectAction extends PlayAndCollectAction {}

export {
  RecordAction,
  PlayMediaAction,
  PlayAudioAction,
  PlaySilenceAction,
  PlayTTSAction,
  PlayMediaAndCollectAction,
  PlayAudioAndCollectAction,
  PlaySilenceAndCollectAction,
  PlayTTSAndCollectAction
}
