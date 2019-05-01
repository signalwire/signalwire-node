import { v4 as uuidv4 } from 'uuid'
import { Execute } from '../../messages/Blade'
import { CallState, DisconnectReason, CallConnectState, DEFAULT_CALL_TIMEOUT, CallNotification } from '../../util/constants/relay'
import { ICall, ICallOptions, ICallDevice, IMakeCallParams, ICallingPlay, ICallingCollect } from '../../util/interfaces'
import * as Actions from './Actions'
import { reduceConnectParams } from '../helpers'
import Calling from './Calling'
import { isFunction } from '../../util/helpers'

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

    return this._execute(msg)
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

    return this._execute(msg)
  }

  /**
   * Connect the call with a new call. The current call must be 'ready'
   * @param peers - One or more peers to connect { type, from, to, timeout }
   * @return Promise
   */
  async connect(...peers: IMakeCallParams[]) {
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
   * Start recording the call. The call must be 'ready'.
   * Note: At this moment hard coded to type: 'audio'.
   * @param options - Params object for the recording { beep, format, stereo, direction, initial_timeout, end_silence_timeout, terminators }
   * @return Promise
   */
  async startRecord(type: string = 'audio', params: any = {}) {
    this._callIdRequired()
    const msg = new Execute({
      protocol: this.relayInstance.protocol,
      method: 'call.record',
      params: {
        node_id: this.nodeId,
        call_id: this.id,
        control_id: uuidv4(),
        type,
        params
      }
    })

    return this._execute(msg)
  }

  /**
   * Stop a recording of the call. The call must be 'ready'.
   * @param control_id - Identifier of the recording to stop.
   * @return Promise
   */
  async stopRecord(control_id: string) {
    this._callIdRequired()
    const msg = new Execute({
      protocol: this.relayInstance.protocol,
      method: 'call.record.stop',
      params: {
        node_id: this.nodeId,
        call_id: this.id,
        control_id
      }
    })

    return this._execute(msg)
  }

  /**
   * Play an audio file to the call. The call must be 'ready'.
   * @param url - URL of the audio file to play.
   * @return Promise
   */
  async playAudio(url: string) {
    const { control_id } = await this._play([{ type: 'audio', params: { url } }])
    return new Actions.PlayAudioAction(this, control_id)
  }

  /**
   * Play seconds of silence to the call. The call must be 'ready'.
   * @param duration - Num. of seconds of silence to play.
   * @return Promise
   */
  async playSilence(duration: number) {
    const { control_id } = await this._play([{ type: 'silence', params: { duration } }])
    return new Actions.PlaySilenceAction(this, control_id)
  }

  /**
   * Play text-to-speech to the call. The call must be 'ready'.
   * @param options - Params object for the TTS { text, language, gender }
   * @return Promise
   */
  async playTTS(options: ICallingPlay['params']) {
    const { control_id } = await this._play([{ type: 'tts', params: options }])
    return new Actions.PlayTTSAction(this, control_id)
  }

  /**
   * Play multiple medias in the call in a serial way. The call must be 'ready'.
   * @param play - One or more media to play { type, params: { } }
   * @return Promise
   */
  async playMedia(...play: ICallingPlay[]) {
    const { control_id } = await this._play(play)
    return new Actions.PlayMediaAction(this, control_id)
  }

  /**
   * Play an audio file and collect digits/speech. The call must be 'ready'.
   * @param collect - Specify collect options
   * @param url - URL of the audio file to play.
   * @return Promise
   */
  async playAudioAndCollect(collect: ICallingCollect, url: string) {
    const { control_id } = await this._playAndCollect(collect, [{ type: 'audio', params: { url } }])
    return new Actions.PlayAudioAndCollectAction(this, control_id)
  }

  /**
   * Play silence to the call and collect digits/speech. The call must be 'ready'.
   * @param collect - Specify collect options
   * @param duration - Num. of seconds of silence to play.
   * @return Promise
   */
  async playSilenceAndCollect(collect: ICallingCollect, duration: number) {
    const { control_id } = await this._playAndCollect(collect, [{ type: 'silence', params: { duration } }])
    return new Actions.PlaySilenceAndCollectAction(this, control_id)
  }

  /**
   * Play text-to-speech and collect digits/speech. The call must be 'ready'.
   * @param collect - Specify collect options
   * @param options - Params object for the TTS { text, language, gender }
   * @return Promise
   */
  async playTTSAndCollect(collect: ICallingCollect, options: ICallingPlay['params']) {
    const { control_id } = await this._playAndCollect(collect, [{ type: 'tts', params: options }])
    return new Actions.PlayTTSAndCollectAction(this, control_id)
  }

  /**
   * Play multiple medias in the call and start collecting digits/speech. The call must be 'ready'.
   * @param collect - Specify collect options
   * @param play - One or more media to play { type, params: { } }
   * @return Promise
   */
  async playMediaAndCollect(collect: ICallingCollect, ...play: ICallingPlay[]) {
    const { control_id } = await this._playAndCollect(collect, play)
    return new Actions.PlayMediaAndCollectAction(this, control_id)
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

  _stateChange(newState: string) {
    this._prevState = this._state
    this._state = CallState[newState]
    this._dispatchCallback('stateChange')
    this._dispatchCallback(newState)
    if (this._state === CallState.ended) {
      this.relayInstance.removeCall(this)
    }
    return this
  }

  _connectStateChange(newState: string) {
    this._prevConnectState = this._connectState
    this._connectState = CallConnectState[newState]
    this._dispatchCallback('connect.stateChange')
    if (!this._dispatchCallback(`connect.${newState}`)) {
      // Backward compat: connect state not scoped with 'connect.'
      this._dispatchCallback(newState)
    }
    return this
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
    if (!control_id || !event_type) {
      return
    }
    const index = this._controls.findIndex(t => t.control_id === control_id)
    if (index >= 0) {
      this._controls[index] = params
    } else {
      this._controls.push(params)
    }
  }

  /**
   * Execute a 'call.play'
   * @param play - One or more media to play { type: string, params: { } }
   * @return Promise
   */
  private async _play(play: ICallingPlay[]) {
    this._callIdRequired()
    const msg = new Execute({
      protocol: this.relayInstance.protocol,
      method: 'call.play',
      params: {
        node_id: this.nodeId,
        call_id: this.id,
        control_id: uuidv4(),
        play
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
  private async _playAndCollect(collect: ICallingCollect, play: ICallingPlay[]) {
    this._callIdRequired()
    const msg = new Execute({
      protocol: this.relayInstance.protocol,
      method: 'call.play_and_collect',
      params: {
        node_id: this.nodeId,
        call_id: this.id,
        control_id: uuidv4(),
        play,
        collect
      }
    })

    return this._execute(msg)
  }
}
