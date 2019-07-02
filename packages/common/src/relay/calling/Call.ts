import { v4 as uuidv4 } from 'uuid'
import { Execute } from '../../messages/Blade'
import { CallState, DisconnectReason, DEFAULT_CALL_TIMEOUT, CallNotification, CallRecordState, CallPlayState } from '../../util/constants/relay'
import { ICall, ICallOptions, ICallDevice, IMakeCallParams, ICallingPlay, ICallingCollect, DeepArray } from '../../util/interfaces'
// import * as Actions from './Actions'
// import * as Results from './Results'
import { reduceConnectParams } from '../helpers'
import Calling from './Calling'
import { isFunction } from '../../util/helpers'
// import Blocker from './Blocker'
import Dial from './components/Dial';
import Hangup from './components/Hangup'
import Record from './components/Record'
import RecordResult from './results/RecordResult'
import RecordAction from './actions/RecordAction'
import HangupResult from './results/HangupResult'

// type TAction = Actions.RecordAction | Actions.PlayAction | Actions.PromptAction | Actions.ConnectAction

export default class Call implements ICall {
  public id: string
  public tag: string = uuidv4()
  public nodeId: string
  public state: string
  public prevState: string
  public failed: boolean
  public busy: boolean

  private _cbQueue: { [state: string]: Function } = {}

  constructor(public relayInstance: Calling, protected options: ICallOptions) {
    const { call_id, node_id } = options
    this.id = call_id
    this.nodeId = node_id
    this.relayInstance.addCall(this)
  }

  get answered(): boolean {
    return this.state === CallState.Answered
  }

  get active(): boolean {
    return !this.ended
  }

  get ended(): boolean {
    return this.state === CallState.Ending || this.state === CallState.Ended
  }

  get context() {
    return this.options.context
  }

  get peer(): Call {
    const { peer: { call_id = null } = {} } = this.options
    return this.relayInstance.getCallById(call_id)
  }

  get device(): ICallDevice {
    return this.options.device
  }

  get ready(): boolean {
    return Boolean(this.id)
  }

  get type(): string {
    const { type } = this.options.device
    return type
  }

  get from(): string {
    const { params: { from_number = '' } = {} } = this.options.device
    return from_number
  }

  get to(): string {
    const { params: { to_number = '' } = {} } = this.options.device
    return to_number
  }

  get timeout(): number {
    const { params: { timeout = DEFAULT_CALL_TIMEOUT } = {} } = this.options.device
    return timeout
  }

  async _execute(msg: Execute) {
    try {
      const { result } = await this.relayInstance.session.execute(msg)
      return result
    } catch (error) {
      const { result = null } = error
      if (result) {
        throw result
      }
      throw error
    }
  }

  async dial() {
    const component = new Dial(this)
    await component.execute()
    await component._waitFor(CallState.Answered, CallState.Ending, CallState.Ended)

    // FIXME:
    return component.result
  }

  async hangup(reason: string = DisconnectReason.Hangup) {
    const component = new Hangup(this, reason)
    await component.execute()
    await component._waitFor(CallState.Ended)

    return new HangupResult(component)
  }

  async record(record: any) {
    const component = new Record(this, record)
    await component.execute()
    await component._waitFor(CallRecordState.NoInput, CallRecordState.Finished)

    return new RecordResult(component)
  }

  async recordAsync(record: any) {
    const component = new Record(this, record)
    await component.execute()

    return new RecordAction(component)
  }

  _stateChange(params: { call_state: string }) {
    const { call_state } = params
    this.prevState = this.state
    this.state = call_state
    this._dispatchCallback('stateChange')
    this._dispatchCallback(call_state)
    if (this.state === CallState.Ended) {
      this.relayInstance.removeCall(this)
    }
  }

  _connectChange(params: { connect_state: string }) {
    const { connect_state } = params
    this._dispatchCallback('connect.stateChange')
    this._dispatchCallback(`connect.${connect_state}`)
  }

  _recordChange(params: any) {
    this._dispatchCallback('record.stateChange', params)
    this._dispatchCallback(`record.${params.state}`, params)
  }

  _playChange(params: any) {
    this._dispatchCallback('play.stateChange', params)
    this._dispatchCallback(`play.${params.state}`, params)
  }

  _collectChange(params: any) {
    this._dispatchCallback('collect', params)
  }

  private _dispatchCallback(key: string, ...params: any) {
    const { [key]: handler } = this._cbQueue
    if (isFunction(handler)) {
      handler(this, ...params)
      return true
    }
    return false
  }
}
