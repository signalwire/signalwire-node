import { v4 as uuidv4 } from 'uuid'
import { Execute } from '../../messages/Blade'
import { CallState, DisconnectReason, CallConnectState, DEFAULT_CALL_TIMEOUT, CallNotification, CallRecordState, CallPlayState } from '../../util/constants/relay'
import { ICall, ICallOptions, ICallDevice, IMakeCallParams, ICallingPlay, ICallingCollect, DeepArray } from '../../util/interfaces'
import * as Actions from './Actions'
import * as Results from './Results'
import { reduceConnectParams } from '../helpers'
import Calling from './Calling'
import { isFunction } from '../../util/helpers'
import Blocker from './Blocker'

export default class Call implements ICall {
  public id: string
  public nodeId: string
  public tag: string = uuidv4()

  private _prevState: number = 0
  private _state: number = 0
  private _prevConnectState: number = 0
  private _connectState: number = 0
  private _cbQueue: { [state: string]: Function } = {}
  private _controls: any[] = []
  private _blockers: Blocker[] = []

  constructor(public relayInstance: Calling, protected options: ICallOptions) {
    const { call_id, node_id } = options
    this.id = call_id
    this.nodeId = node_id
    this.relayInstance.addCall(this)
  }

  /**
   * Registers a callback to dispatch when the 'event' occur.
   * @param event - Event to listen to.
   * @param callback - Function to dispatch.
   * @return this
   */
  on(event: string, callback: Function) {
    if (this.ready && !isNaN(Number(CallState[event])) && this._state >= CallState[event]) {
      callback(this)
    }
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

  /**
   * Begin the call
   * @return Promise
   */
  begin() {
    const msg = new Execute({
      protocol: this.relayInstance.protocol,
      method: 'call.begin',
      params: {
        tag: this.tag,
        device: this.device
      }
    })

    return this._execute(msg)
  }

  /**
   * Hangup the call. The call must be 'ready'
   * @return Promise
   */
  async hangup() {
    this._callIdRequired()
    const msg = new Execute({
      protocol: this.relayInstance.protocol,
      method: 'call.end',
      params: {
        node_id: this.nodeId,
        call_id: this.id,
        reason: DisconnectReason.Hangup
      }
    })

    const hangupResult = new Results.HangupResult()
    const blocker = new Blocker(this.id, CallNotification.State, ({ call_state, reason = DisconnectReason.Hangup }) => {
      if (call_state === 'ended') {
        hangupResult.reason = reason
        blocker.resolve(hangupResult)
      }
    })
    this._blockers.push(blocker)

    hangupResult.result = await this._execute(msg)
    return blocker.promise
  }

  /**
   * Answer the inbound call. The call must be 'ready'
   * @return Promise
   */
  async answer() {
    this._callIdRequired()
    const msg = new Execute({
      protocol: this.relayInstance.protocol,
      method: 'call.answer',
      params: {
        node_id: this.nodeId,
        call_id: this.id
      }
    })

    const answerResult = new Results.AnswerResult()
    const blocker = new Blocker(this.id, CallNotification.State, ({ call_state }) => {
      if (call_state === 'answered') {
        blocker.resolve(answerResult)
      }
    })
    this._blockers.push(blocker)

    answerResult.result = await this._execute(msg)
    return blocker.promise
  }

  /**
   * Connect the call with a new call. The current call must be 'ready'
   * @param peers - One or more peers to connect { type, from, to, timeout }
   * @return Promise
   */
  async connect(...peers: DeepArray<IMakeCallParams>) {
    this._callIdRequired()
    const devices = reduceConnectParams(peers, this.device)
    if (!devices.length) {
      throw new Error('No peers to connect!')
    }
    const msg = new Execute({
      protocol: this.relayInstance.protocol,
      method: 'call.connect',
      params: {
        node_id: this.nodeId,
        call_id: this.id,
        devices
      }
    })

    return this._execute(msg)
  }

  /**
   * Connect the call with a new call and wait the result of connect. The current call must be 'ready'
   * @param peers - One or more peers to connect { type, from, to, timeout }
   * @return Promise
   */
  async connectSync(...peers: DeepArray<IMakeCallParams>) {
    this._callIdRequired()
    const blocker = new Blocker(this.id, CallNotification.Connect, (params: any) => {
      const { connect_state } = params
      if (connect_state === 'connected') {
        blocker.resolve(this)
      } else if (connect_state === 'failed') {
        blocker.resolve(params)
      }
    })
    this._blockers.push(blocker)

    await this.connect(...peers)
    return blocker.promise
  }

  /**
   * Start recording the call. The call must be 'ready'.
   * Note: At this moment hard coded to type: 'audio'.
   * @param options - Params object for the recording { beep, format, stereo, direction, initial_timeout, end_silence_timeout, terminators }
   * @return Promise
   */
  async record(record: any) {
    const action = new Actions.RecordAction(this)

    await this._record(record, action.controlId)

    return action
  }

  async recordSync(record: any) {
    const control_id = uuidv4()
    const blocker = new Blocker(control_id, CallNotification.Record, (params: any) => {
      if (params.state !== CallRecordState.Recording) {
        const result = new Results.RecordResult(params)
        blocker.resolve(result)
      }
    })
    this._blockers.push(blocker)
    await this._record(record, control_id)

    return blocker.promise
  }

  /**
   * Play an audio file to the call. The call must be 'ready'.
   * @param url - URL of the audio file to play.
   * @return Promise
   */
  async playAudio(url: string) {
    const action = new Actions.PlayAction(this)

    const params: ICallingPlay[] = [{ type: 'audio', params: { url } }]
    await this._play(params, action.controlId)

    return action
  }

  /**
   * Play an audio file on the call and wait for the media to finish. The call must be 'ready'.
   * @param url - URL of the audio file to play.
   * @return Promise
   */
  playAudioSync(url: string) {
    return this._playSync([{ type: 'audio', params: { url } }])
  }

  /**
   * Play seconds of silence to the call. The call must be 'ready'.
   * @param duration - Num. of seconds of silence to play.
   * @return Promise
   */
  async playSilence(duration: number) {
    const action = new Actions.PlayAction(this)

    const params: ICallingPlay[] = [{ type: 'silence', params: { duration } }]
    await this._play(params, action.controlId)

    return action
  }

  /**
   * Play seconds of silence on the call and wait for the media to finish. The call must be 'ready'.
   * @param duration - Num. of seconds of silence to play.
   * @return Promise
   */
  playSilenceSync(duration: number) {
    return this._playSync([{ type: 'silence', params: { duration } }])
  }

  /**
   * Play text-to-speech to the call. The call must be 'ready'.
   * @param options - Params object for the TTS { text, language, gender }
   * @return Promise
   */
  async playTTS(options: ICallingPlay['params']) {
    const action = new Actions.PlayAction(this)

    const params: ICallingPlay[] = [{ type: 'tts', params: options }]
    await this._play(params, action.controlId)

    return action
  }

  /**
   * Play text-to-speech on the call and wait for the media to finish. The call must be 'ready'.
   * @param options - Params object for the TTS { text, language, gender }
   * @return Promise
   */
  playTTSSync(options: ICallingPlay['params']) {
    return this._playSync([{ type: 'tts', params: options }])
  }

  /**
   * Play multiple medias in the call in a serial way. The call must be 'ready'.
   * @param play - One or more media to play { type, params: { } }
   * @return Promise
   */
  async play(...play: ICallingPlay[]) {
    const action = new Actions.PlayAction(this)

    await this._play(play, action.controlId)

    return action
  }

  /**
   * Play multiple medias in the call in a serial-sync way. The call must be 'ready'.
   * @param play - One or more media to play { type, params: { } }
   * @return Promise
   */
  playSync(...play: ICallingPlay[]) {
    return this._playSync(play)
  }

  /**
   * Play an audio file and collect digits/speech. The call must be 'ready'.
   * @param collect - Specify collect options
   * @param url - URL of the audio file to play.
   * @return Promise
   */
  async promptAudio(collect: ICallingCollect, url: string) {
    const action = new Actions.PromptAction(this)

    const params: ICallingPlay[] = [{ type: 'audio', params: { url } }]
    await this._prompt(collect, params, action.controlId)

    return action
  }

  /**
   * Play an audio file and collect digits/speech. The call must be 'ready'.
   * @param collect - Specify collect options
   * @param url - URL of the audio file to play.
   * @return Promise
   */
  promptAudioSync(collect: ICallingCollect, url: string) {
    return this._promptSync(collect, [{ type: 'audio', params: { url } }])
  }

  /**
   * Play text-to-speech and collect digits/speech. The call must be 'ready'.
   * @param collect - Specify collect options
   * @param options - Params object for the TTS { text, language, gender }
   * @return Promise
   */
  async promptTTS(collect: ICallingCollect, options: ICallingPlay['params']) {
    const action = new Actions.PromptAction(this)

    const params: ICallingPlay[] = [{ type: 'tts', params: options }]
    await this._prompt(collect, params, action.controlId)

    return action
  }

  /**
   * Play text-to-speech and collect digits/speech. The call must be 'ready'.
   * @param collect - Specify collect options
   * @param options - Params object for the TTS { text, language, gender }
   * @return Promise
   */
  promptTTSSync(collect: ICallingCollect, options: ICallingPlay['params']) {
    return this._promptSync(collect, [{ type: 'tts', params: options }])
  }

  /**
   * Play multiple medias in the call and start collecting digits/speech. The call must be 'ready'.
   * @param collect - Specify collect options
   * @param play - One or more media to play { type, params: { } }
   * @return Promise
   */
  async prompt(collect: ICallingCollect, ...play: ICallingPlay[]) {
    const action = new Actions.PromptAction(this)

    await this._prompt(collect, play, action.controlId)

    return action
  }

  /**
   * Play multiple medias in the call and start collecting digits/speech. The call must be 'ready'.
   * @param collect - Specify collect options
   * @param play - One or more media to play { type, params: { } }
   * @return Promise
   */
  promptSync(collect: ICallingCollect, ...play: ICallingPlay[]) {
    return this._promptSync(collect, play)
  }

  get prevState() {
    return CallState[this._prevState]
  }

  get state() {
    return CallState[this._state]
  }

  get prevConnectState() {
    return CallConnectState[this._prevConnectState]
  }

  get connectState() {
    return CallConnectState[this._connectState]
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

  get recordings() {
    return this._controls.filter(t => t.event_type === CallNotification.Record)
  }

  get playbacks() {
    return this._controls.filter(t => t.event_type === CallNotification.Play)
  }

  setOptions(opts: ICallOptions) {
    this.options = { ...this.options, ...opts }
  }

  _stateChange(params: { call_state: string }) {
    const { call_state } = params
    this._prevState = this._state
    this._state = CallState[call_state]
    this._addControlParams(params)
    this._dispatchCallback('stateChange')
    this._dispatchCallback(call_state)
    if (this._state === CallState.ended) {
      this.relayInstance.removeCall(this)
    }
  }

  _connectStateChange(params: { connect_state: string }) {
    const { connect_state } = params
    this._prevConnectState = this._connectState
    this._connectState = CallConnectState[connect_state]
    this._addControlParams(params)
    this._dispatchCallback('connect.stateChange')
    if (!this._dispatchCallback(`connect.${connect_state}`)) {
      // Backward compat: connect state not scoped with 'connect.'
      this._dispatchCallback(connect_state)
    }
  }

  _recordStateChange(params: any) {
    this._addControlParams(params)
    this._dispatchCallback('record.stateChange', params)
    this._dispatchCallback(`record.${params.state}`, params)
  }

  _playStateChange(params: any) {
    this._addControlParams(params)
    this._dispatchCallback('play.stateChange', params)
    this._dispatchCallback(`play.${params.state}`, params)
  }

  _collectStateChange(params: any) {
    this._addControlParams(params)
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

  private _callIdRequired() {
    if (!this.ready) {
      throw new Error('Call has not started.')
    }
  }

  public async _execute(msg: Execute) {
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

  private _addControlParams(params: any) {
    const { control_id, event_type } = params
    if (!event_type) {
      return
    }
    const index = this._controls.findIndex(t => t.control_id === control_id)
    if (index >= 0) {
      this._controls[index] = params
    } else {
      this._controls.push(params)
    }
    const checkId = control_id ? control_id : this.id
    this._blockers.forEach(b => {
      if (b.controlId === checkId && b.eventType === event_type) {
        b.resolver(params)
      }
    })
  }

  /**
   * Execute a 'call.play'
   * @param play - One or more media to play { type: string, params: { } }
   * @return Promise
   */
  private async _play(play: ICallingPlay[], control_id: string) {
    this._callIdRequired()
    const msg = new Execute({
      protocol: this.relayInstance.protocol,
      method: 'call.play',
      params: {
        node_id: this.nodeId,
        call_id: this.id,
        control_id,
        play
      }
    })

    return this._execute(msg)
  }

  /**
   * Play an audio file to the call. The call must be 'ready'.
   * @param url - URL of the audio file to play.
   * @return Promise
   */
  async _playSync(play: ICallingPlay[]) {
    const control_id = uuidv4()
    const blocker = new Blocker(control_id, CallNotification.Play, (params: any) => {
      if (params.state !== CallPlayState.Playing) {
        const result = new Results.RecordResult(params)
        blocker.resolve(result)
      }
    })
    this._blockers.push(blocker)
    await this._play(play, control_id)

    return blocker.promise
  }

  /**
   * Execute a 'call.play_and_collect'
   * @param collect - Object with collect preferences
   * @param play - One or more media to play { type: string, params: { } }
   * @return Promise
   */
  private async _prompt(collect: ICallingCollect, play: ICallingPlay[], control_id: string) {
    this._callIdRequired()
    const msg = new Execute({
      protocol: this.relayInstance.protocol,
      method: 'call.play_and_collect',
      params: {
        node_id: this.nodeId,
        call_id: this.id,
        control_id,
        play,
        collect
      }
    })

    return this._execute(msg)
  }

  /**
   * Execute a 'call.play_and_collect'
   * @param collect - Object with collect preferences
   * @param play - One or more media to play { type: string, params: { } }
   * @return Promise
   */
  private async _promptSync(collect: ICallingCollect, play: ICallingPlay[]) {
    const control_id = uuidv4()
    const blocker = new Blocker(control_id, CallNotification.Collect, (params: any) => {
      const result = new Results.PromptResult(params)
      blocker.resolve(result)
    })
    this._blockers.push(blocker)
    await this._prompt(collect, play, control_id)

    return blocker.promise
  }

  private async _record(record: any, control_id: string) {
    this._callIdRequired()
    const msg = new Execute({
      protocol: this.relayInstance.protocol,
      method: 'call.record',
      params: {
        node_id: this.nodeId,
        call_id: this.id,
        control_id,
        record
      }
    })

    return this._execute(msg)
  }
}
