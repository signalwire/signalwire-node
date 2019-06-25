// import { v4 as uuidv4 } from 'uuid'
// import Call from './Call'
import { CallConnectState, CallPlayState, CallPromptState, CallRecordState } from '../../util/constants/relay'

class AnswerResult {
  public result: any
}

class HangupResult {
  public result: any
  public reason: string
}

class ConnectResult {
//   // TODO: implement
//   public result: string
//   public state: string

//   constructor(params: any) {
//     // TODO: add Result/Call and Payload
//     // $this->state = $params->connect_state
//     // $this->finished = $this->state !== ConnectState::Connecting
//   }
}

class RecordResult {
  public controlId: string
  public state: string
  public url: string
  public result: string
  public succeeded: boolean
  public failed: boolean

  constructor(params: any) {
    this.controlId = params.control_id
    this.state = params.state
    this.url = params.url
    this.result = params.record

    this.succeeded = this.state === CallRecordState.Finished
    this.failed = this.state === CallRecordState.NoInput
  }
}

class PlayResult {
  public controlId: string
  public result: string
  public state: string
  public succeeded: boolean
  public failed: boolean

  constructor(params: any) {
    this.controlId = params.control_id
    this.state = params.state
    this.succeeded = this.state === CallPlayState.Finished
    this.failed = this.state === CallPlayState.Error
  }
}

class PromptResult {
  public controlId: string
  public result: string
  public state: string
  public type: string
  public succeeded: boolean
  public failed: boolean

  constructor(params: any) {
    this.controlId = params.control_id
    const { result } = params
    switch (result.type) {
      case CallPromptState.Digit:
      case CallPromptState.Speech:
        this.state = 'successful'
        this.type = result.type
        this.result = result.params
        this.succeeded = true
        this.failed = false
        break
      default:
        this.state = result.type
        this.succeeded = false
        this.failed = true
    }
  }
}

export {
  AnswerResult,
  HangupResult,
  ConnectResult,
  RecordResult,
  PlayResult,
  PromptResult,
}
