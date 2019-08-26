import { v4 as uuidv4 } from 'uuid'
import logger from '../../util/logger'
import { Execute } from '../../messages/Blade'
import { CallState, DisconnectReason, DEFAULT_CALL_TIMEOUT, CallNotification, CallRecordState, CallPlayState, CallPromptState, CallConnectState, CALL_STATES, CallFaxState, CallDetectState, CallDetectType, CallTapState, SendDigitsState } from '../../util/constants/relay'
import { ICall, ICallOptions, ICallDevice, IMakeCallParams, ICallingPlay, ICallingCollect, DeepArray, ICallingDetect, ICallingDetectArg, ICallingTapTapArg, ICallingTapDeviceArg } from '../../util/interfaces'
import { reduceConnectParams } from '../helpers'
import Calling from './Calling'
import { isFunction } from '../../util/helpers'
import BaseComponent from './components/BaseComponent'
import Dial from './components/Dial'
import Hangup from './components/Hangup'
import HangupResult from './results/HangupResult'
import Record from './components/Record'
import RecordResult from './results/RecordResult'
import RecordAction from './actions/RecordAction'
import Answer from './components/Answer'
import AnswerResult from './results/AnswerResult'
import Play from './components/Play'
import PlayResult from './results/PlayResult'
import PlayAction from './actions/PlayAction'
import Prompt from './components/Prompt'
import PromptResult from './results/PromptResult'
import PromptAction from './actions/PromptAction'
import Connect from './components/Connect'
import ConnectResult from './results/ConnectResult'
import ConnectAction from './actions/ConnectAction'
import DialResult from './results/DialResult'
import Await from './components/Await'
import FaxReceive from './components/FaxReceive'
import FaxResult from './results/FaxResult'
import FaxAction from './actions/FaxAction'
import FaxSend from './components/FaxSend'
import Detect from './components/Detect'
import DetectResult from './results/DetectResult'
import DetectAction from './actions/DetectAction'
import Tap from './components/Tap'
import TapResult from './results/TapResult'
import TapAction from './actions/TapAction'
import SendDigits from './components/SendDigits'
import SendDigitsResult from './results/SendDigitsResult'
import SendDigitsAction from './actions/SendDigitsAction'

export default class Call implements ICall {
  public id: string
  public tag: string = uuidv4()
  public nodeId: string
  public state: string = CallState.None
  public prevState: string = CallState.None
  public failed: boolean = false
  public busy: boolean = false
  public amd: Function
  public amdAsync: Function

  private _cbQueue: { [state: string]: Function } = {}
  private _components: BaseComponent[] = []

  constructor(public relayInstance: Calling, protected options: ICallOptions) {
    const { call_id, node_id } = options
    this.id = call_id
    this.nodeId = node_id
    this.amd = this.detectAnsweringMachine.bind(this)
    this.amdAsync = this.detectAnsweringMachineAsync.bind(this)
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

  setOptions(opts: ICallOptions) {
    this.options = { ...this.options, ...opts }
  }

  async _execute(msg: Execute) {
    try {
      return await this.relayInstance.session.execute(msg)
    } catch (error) {
      logger.error(`Relay command failed with code: ${error.code} - ${error.message}`)
      throw error
    }
  }

  async dial() {
    const component = new Dial(this)
    this._addComponent(component)
    await component._waitFor(CallState.Answered, CallState.Ending, CallState.Ended)

    return new DialResult(component)
  }

  async hangup(reason: string = DisconnectReason.Hangup) {
    const component = new Hangup(this, reason)
    this._addComponent(component)
    await component._waitFor(CallState.Ended)

    return new HangupResult(component)
  }

  async answer() {
    const component = new Answer(this)
    this._addComponent(component)
    await component._waitFor(CallState.Answered, CallState.Ending, CallState.Ended)

    return new AnswerResult(component)
  }

  async record(record: any) {
    const component = new Record(this, record)
    this._addComponent(component)
    await component._waitFor(CallRecordState.NoInput, CallRecordState.Finished)

    return new RecordResult(component)
  }

  async recordAsync(record: any) {
    const component = new Record(this, record)
    this._addComponent(component)
    await component.execute()

    return new RecordAction(component)
  }

  async play(...play: ICallingPlay[]): Promise<PlayResult> {
    const component = new Play(this, play)
    this._addComponent(component)
    await component._waitFor(CallPlayState.Error, CallPlayState.Finished)

    return new PlayResult(component)
  }

  async playAsync(...play: ICallingPlay[]): Promise<PlayAction> {
    const component = new Play(this, play)
    this._addComponent(component)
    await component.execute()

    return new PlayAction(component)
  }

  playAudio(url: string): Promise<PlayResult> {
    return this.play({ type: 'audio', params: { url } })
  }

  playAudioAsync(url: string): Promise<PlayAction> {
    return this.playAsync({ type: 'audio', params: { url } })
  }

  playSilence(duration: number): Promise<PlayResult> {
    return this.play({ type: 'silence', params: { duration } })
  }

  playSilenceAsync(duration: number): Promise<PlayAction> {
    return this.playAsync({ type: 'silence', params: { duration } })
  }

  playTTS(params: ICallingPlay['params']): Promise<PlayResult> {
    return this.play({ type: 'tts', params })
  }

  playTTSAsync(params: ICallingPlay['params']): Promise<PlayAction> {
    return this.playAsync({ type: 'tts', params })
  }

  async prompt(collect: ICallingCollect, ...play: ICallingPlay[]): Promise<PromptResult> {
    const component = new Prompt(this, collect, play)
    this._addComponent(component)
    await component._waitFor(CallPromptState.Error, CallPromptState.NoInput, CallPromptState.NoMatch, CallPromptState.Digit, CallPromptState.Speech)

    return new PromptResult(component)
  }

  async promptAsync(collect: ICallingCollect, ...play: ICallingPlay[]): Promise<PromptAction> {
    const component = new Prompt(this, collect, play)
    this._addComponent(component)
    await component.execute()

    return new PromptAction(component)
  }

  promptAudio(collect: ICallingCollect, url: string): Promise<PromptResult> {
    return this.prompt(collect, { type: 'audio', params: { url } })
  }

  promptAudioAsync(collect: ICallingCollect, url: string): Promise<PromptAction> {
    return this.promptAsync(collect, { type: 'audio', params: { url } })
  }

  promptTTS(collect: ICallingCollect, params: ICallingPlay['params']): Promise<PromptResult> {
    return this.prompt(collect, { type: 'tts', params })
  }

  promptTTSAsync(collect: ICallingCollect, params: ICallingPlay['params']): Promise<PromptAction> {
    return this.promptAsync(collect, { type: 'tts', params })
  }

  async connect(...peers: DeepArray<IMakeCallParams>): Promise<ConnectResult> {
    const devices = reduceConnectParams(peers, this.device)
    const component = new Connect(this, devices)
    this._addComponent(component)
    await component._waitFor(CallConnectState.Failed, CallConnectState.Connected)

    return new ConnectResult(component)
  }

  async connectAsync(...peers: DeepArray<IMakeCallParams>): Promise<ConnectAction> {
    const devices = reduceConnectParams(peers, this.device)
    const component = new Connect(this, devices)
    this._addComponent(component)
    await component.execute()

    return new ConnectAction(component)
  }

  async waitFor(...events: string[]): Promise<boolean> {
    if (!events.length) {
      events = [CallState.Ended]
    }
    const currentStateIndex = CALL_STATES.indexOf(this.state)
    for (let i = 0; i < events.length; i++) {
      const index = CALL_STATES.indexOf(events[i])
      if (index <= currentStateIndex) {
        return true
      }
    }
    const component = new Await(this)
    this._addComponent(component)
    await component._waitFor(...events)

    return component.successful
  }

  waitForRinging() {
    return this.waitFor(CallState.Ringing)
  }

  waitForAnswered() {
    return this.waitFor(CallState.Answered)
  }

  waitForEnding() {
    return this.waitFor(CallState.Ending)
  }

  waitForEnded() {
    return this.waitFor(CallState.Ended)
  }

  async faxReceive(): Promise<FaxResult> {
    const component = new FaxReceive(this)
    this._addComponent(component)
    await component._waitFor(CallFaxState.Error, CallFaxState.Finished)

    return new FaxResult(component)
  }

  async faxReceiveAsync(): Promise<FaxAction> {
    const component = new FaxReceive(this)
    this._addComponent(component)
    await component.execute()

    return new FaxAction(component)
  }

  async faxSend(document: string, identity: string = null, header: string = null): Promise<FaxResult> {
    const component = new FaxSend(this, document, identity, header)
    this._addComponent(component)
    await component._waitFor(CallFaxState.Error, CallFaxState.Finished)

    return new FaxResult(component)
  }

  async faxSendAsync(document: string, identity: string = null, header: string = null): Promise<FaxAction> {
    const component = new FaxSend(this, document, identity, header)
    this._addComponent(component)
    await component.execute()

    return new FaxAction(component)
  }

  async detect(options: ICallingDetectArg): Promise<DetectResult> {
    const { type, timeout, ...params } = options
    const component = new Detect(this, { type, params }, timeout)
    this._addComponent(component)
    await component._waitFor(CallDetectState.Machine, CallDetectState.Human, CallDetectState.Unknown, CallDetectState.CED, CallDetectState.CNG)

    return new DetectResult(component)
  }

  async detectAsync(options: ICallingDetectArg): Promise<DetectAction> {
    const { type, timeout, ...params } = options
    const component = new Detect(this, { type, params }, timeout)
    this._addComponent(component)
    await component.execute()

    return new DetectAction(component)
  }

  async detectAnsweringMachine({ timeout, waitForBeep = false, ...params }: ICallingDetectArg = {}): Promise<DetectResult> {
    const component = new Detect(this, { type: CallDetectType.Machine, params }, timeout, waitForBeep)
    this._addComponent(component)
    await component._waitFor(CallDetectState.Machine, CallDetectState.Human, CallDetectState.Unknown)

    return new DetectResult(component)
  }

  async detectAnsweringMachineAsync({ timeout, waitForBeep = false, ...params }: ICallingDetectArg = {}): Promise<DetectAction> {
    const component = new Detect(this, { type: CallDetectType.Machine, params }, timeout, waitForBeep)
    this._addComponent(component)
    await component.execute()

    return new DetectAction(component)
  }

  /**
   * @deprecated Since version 2.2. Will be deleted in version 3.0. Use detectAnsweringMachine instead.
   */
  async detectHuman({ type, timeout, ...params }: ICallingDetectArg = {}): Promise<DetectResult> {
    logger.warn('detectHuman has been deprecated: use detectAnsweringMachine instead.')
    const component = new Detect(this, { type: CallDetectType.Machine, params }, timeout)
    this._addComponent(component)
    await component._waitFor(CallDetectState.Machine, CallDetectState.Human, CallDetectState.Unknown)
    component.successful = component.result === CallDetectState.Human

    return new DetectResult(component)
  }

  /**
   * @deprecated Since version 2.2. Will be deleted in version 3.0. Use detectAnsweringMachineAsync instead.
   */
  async detectHumanAsync({ type, timeout, ...params }: ICallingDetectArg = {}): Promise<DetectAction> {
    logger.warn('detectHumanAsync has been deprecated: use detectAnsweringMachineAsync instead.')
    const component = new Detect(this, { type: CallDetectType.Machine, params }, timeout)
    this._addComponent(component)
    await component.execute()

    return new DetectAction(component)
  }

  /**
   * @deprecated Since version 2.2. Will be deleted in version 3.0. Use detectAnsweringMachine instead.
   */
  async detectMachine({ type, timeout, ...params }: ICallingDetectArg = {}): Promise<DetectResult> {
    logger.warn('detectMachine has been deprecated: use detectAnsweringMachine instead.')
    const component = new Detect(this, { type: CallDetectType.Machine, params }, timeout)
    this._addComponent(component)
    await component._waitFor(CallDetectState.Machine, CallDetectState.Human, CallDetectState.Unknown)
    component.successful = component.result === CallDetectState.Machine

    return new DetectResult(component)
  }

  /**
   * @deprecated Since version 2.2. Will be deleted in version 3.0. Use detectAnsweringMachineAsync instead.
   */
  async detectMachineAsync({ type, timeout, ...params }: ICallingDetectArg = {}): Promise<DetectAction> {
    logger.warn('detectMachineAsync has been deprecated: use detectAnsweringMachineAsync instead.')
    const component = new Detect(this, { type: CallDetectType.Machine, params }, timeout)
    this._addComponent(component)
    await component.execute()

    return new DetectAction(component)
  }

  async detectFax(options: ICallingDetectArg): Promise<DetectResult> {
    const { detect, events, timeout } = this._prepareDetectFaxParams(options)
    const component = new Detect(this, detect, timeout)
    this._addComponent(component)
    await component._waitFor(...events)

    return new DetectResult(component)
  }

  async detectFaxAsync(options: ICallingDetectArg): Promise<DetectAction> {
    const { detect, timeout } = this._prepareDetectFaxParams(options)
    const component = new Detect(this, detect, timeout)
    this._addComponent(component)
    await component.execute()

    return new DetectAction(component)
  }

  async detectDigit({ digits, timeout }: ICallingDetectArg = {}): Promise<DetectResult> {
    return this.detect({ type: CallDetectType.Digit, digits, timeout })
  }

  async detectDigitAsync({ digits, timeout }: ICallingDetectArg = {}): Promise<DetectAction> {
    return this.detectAsync({ type: CallDetectType.Digit, digits, timeout })
  }

  async tap(tap: ICallingTapTapArg, device: ICallingTapDeviceArg): Promise<TapResult> {
    const { type: tapType, ...tapParams } = tap
    const { type: deviceType, ...deviceParams } = device
    const component = new Tap(this, { type: tapType, params: tapParams }, { type: deviceType, params: deviceParams })
    this._addComponent(component)
    await component._waitFor(CallTapState.Finished)

    return new TapResult(component)
  }

  async tapAsync(tap: ICallingTapTapArg, device: ICallingTapDeviceArg): Promise<TapAction> {
    const { type: tapType, ...tapParams } = tap
    const { type: deviceType, ...deviceParams } = device
    const component = new Tap(this, { type: tapType, params: tapParams }, { type: deviceType, params: deviceParams })
    this._addComponent(component)
    await component.execute()

    return new TapAction(component)
  }

  async sendDigits(digits: string): Promise<SendDigitsResult> {
    const component = new SendDigits(this, digits)
    this._addComponent(component)
    await component._waitFor(SendDigitsState.Finished)

    return new SendDigitsResult(component)
  }

  async sendDigitsAsync(digits: string): Promise<SendDigitsAction> {
    const component = new SendDigits(this, digits)
    this._addComponent(component)
    await component.execute()

    return new SendDigitsAction(component)
  }

  /**
   * Registers a callback to dispatch when the 'event' occur.
   * @param event - Event to listen to.
   * @param callback - Function to dispatch.
   * @return this
   */
  on(event: string, callback: Function) {
    this._cbQueue[event] = callback
    return this
  }

  /**
   * Removes the callback registered for the 'event'.
   * @param event - Event to listen to.
   * @param callback - Function to remove.
   * @return this
   */
  off(event: string, callback?: Function) {
    delete this._cbQueue[event]
    return this
  }

  _stateChange(params: { call_state: string, end_reason?: string }) {
    const { call_state, end_reason } = params
    this.prevState = this.state
    this.state = call_state
    this._notifyComponents(CallNotification.State, this.tag, params)
    this._dispatchCallback('stateChange')
    this._dispatchCallback(call_state)
    if (this.state === CallState.Ended) {
      this.busy = end_reason === DisconnectReason.Busy
      this.failed = end_reason === DisconnectReason.Error
      this._terminateComponents(params)
      this.relayInstance.removeCall(this)
    }
  }

  _connectChange(params: { connect_state: string }) {
    const { connect_state } = params
    this._notifyComponents(CallNotification.Connect, this.tag, params)
    this._dispatchCallback('connect.stateChange')
    this._dispatchCallback(`connect.${connect_state}`)
  }

  _recordChange(params: any) {
    this._notifyComponents(CallNotification.Record, params.control_id, params)
    this._dispatchCallback('record.stateChange', params)
    this._dispatchCallback(`record.${params.state}`, params)
  }

  _playChange(params: any) {
    this._notifyComponents(CallNotification.Play, params.control_id, params)
    this._dispatchCallback('play.stateChange', params)
    this._dispatchCallback(`play.${params.state}`, params)
  }

  _collectChange(params: any) {
    this._notifyComponents(CallNotification.Collect, params.control_id, params)
    this._dispatchCallback('collect', params)
  }

  _faxChange(params: any) {
    this._notifyComponents(CallNotification.Fax, params.control_id, params)
    this._dispatchCallback('fax.stateChange', params)
    if (params.fax && params.fax.type) {
      this._dispatchCallback(`fax.${params.fax.type}`, params)
    }
  }

  _detectChange(params: any) {
    this._notifyComponents(CallNotification.Detect, params.control_id, params)

    const { params: { event = null } } = params.detect
    if (event === CallDetectState.Finished || event === CallDetectState.Error) {
      this._dispatchCallback(`detect.${event}`, params)
    } else if (event) {
      this._dispatchCallback('detect.update', params)
    }
  }

  _tapChange(params: any) {
    this._notifyComponents(CallNotification.Tap, params.control_id, params)
    this._dispatchCallback(`tap.${params.state}`, params)
  }

  _sendDigitsChange(params: any) {
    this._notifyComponents(CallNotification.SendDigits, params.control_id, params)
    this._dispatchCallback(`sendDigits.stateChange`, params)
    this._dispatchCallback(`sendDigits.${params.state}`, params)
  }

  private _notifyComponents(eventType: string, controlId: string, params: any): void {
    this._components.forEach(component => {
      if (component.completed === false && component.eventType === eventType && component.controlId === controlId) {
        component.notificationHandler(params)
      }
    })
  }

  private _terminateComponents(params: any): void {
    this._components.forEach(component => {
      if (component.completed === false) {
        component.terminate(params)
      }
    })
  }

  private _addComponent(component: BaseComponent): void {
    this._components.push(component)
  }

  private _dispatchCallback(key: string, ...params: any) {
    const { [key]: handler } = this._cbQueue
    if (isFunction(handler)) {
      handler(this, ...params)
      return true
    }
    return false
  }

  private _prepareDetectFaxParams(options: ICallingDetectArg): { detect: ICallingDetect, events: string[], timeout: number } {
    const { tone, timeout } = options
    const faxEvents: string[] = [CallDetectState.CED, CallDetectState.CNG]
    let events: string[] = []
    const params: { tone?: string } = {}
    if (tone && faxEvents.includes(tone)) {
      params.tone = tone
      events.push(tone)
    } else {
      events = events.concat(faxEvents)
    }
    const detect: ICallingDetect = { type: CallDetectType.Fax, params }
    return { detect, events, timeout }
  }
}
