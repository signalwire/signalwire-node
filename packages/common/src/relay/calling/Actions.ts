import { v4 as uuidv4 } from 'uuid'
import { CallConnectState, CallPlayState, CallPromptState, CallRecordState } from '../../util/constants/relay'
import * as Results from './Results'
import { Execute } from '../../messages/Blade'
import Call from './Call'

abstract class BaseAction {
  public controlId: string = uuidv4()
  public finished: boolean = false
  public state: string = null
  public result: any

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

  update(params: any) {
    this.state = params.state

    if (this.state !== CallRecordState.Recording) {
      this.finished = true
      this.result = new Results.RecordResult(params)
    }
  }
}

class PlayAction extends StoppableAction {
  protected baseMethod = 'call.play'

  update(params: any) {
    this.state = params.state

    if (this.state !== CallPlayState.Playing) {
      this.finished = true
      this.result = new Results.PlayResult(params)
    }
  }
}

class PromptAction extends StoppableAction {
  protected baseMethod = 'call.play_and_collect'

  update(params: any) {
    switch (params.result.type) {
      case CallPromptState.Digit:
      case CallPromptState.Speech:
        this.state = 'successful'
        break
      default:
        this.state = params.result.type
    }
    this.finished = true
    this.result = new Results.PromptResult(params)
  }
}

class ConnectAction extends BaseAction {
  protected baseMethod = null

  update(params: any) {
    // TODO: add Result/Call and Payload
    this.state = params.connect_state
    this.finished = this.state !== CallConnectState.Connecting
  }
}

export {
  RecordAction,
  PlayAction,
  PromptAction,
  ConnectAction,
}
