import { v4 as uuidv4 } from 'uuid'
import { Execute } from '../../messages/Blade'
import Call from './Call'

abstract class BaseAction {
  public controlId: string = uuidv4()
  protected abstract baseMethod: string

  constructor(public call: Call) {}
}

class StoppableAction extends BaseAction {
  protected baseMethod = ''

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

class RecordAction extends StoppableAction {
  protected baseMethod = 'call.record'
}

class PlayAction extends StoppableAction {
  protected baseMethod = 'call.play'
}

class PromptAction extends StoppableAction {
  protected baseMethod = 'call.play_and_collect'
}

class ConnectAction extends BaseAction {
  protected baseMethod = ''
}

export {
  RecordAction,
  PlayAction,
  PromptAction,
  ConnectAction,
}
