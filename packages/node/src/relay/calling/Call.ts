import { v4 as uuidv4 } from 'uuid'
import { Execute } from '../../../../common/src/messages/Blade'
import { deRegister, registerOnce, trigger } from '../../../../common/src/services/Handler'
import { CallState, CALL_STATES, DisconnectReason, CallConnectState } from '../../../../common/src/util/constants/relay'
import { ICall, ICallOptions, ICallDevice } from '../../../../common/src/util/interfaces'
import logger from '../../../../common/src/util/logger'
import { reduceConnectParams } from '../helpers'
import Calling from './Calling'

export default class Call implements ICall {
  public id: string
  public nodeId: string

  private _prevState: number = 0
  private _state: number = 0
  private _cbQueues: { [state: string]: Function } = {}
  private _mediaControlId: string = ''

  constructor(protected relayInstance: Calling, protected options: ICallOptions) {
    this._attachListeners = this._attachListeners.bind(this)
    this._detachListeners = this._detachListeners.bind(this)
    this._init(options)
  }

  private _init(params: any) {
    const { call_id, call_state = CallState[1], device = this._device, node_id } = params
    this._device = device
    this._state = Number(CallState[call_state])
    if (!call_id) {
      return
    } else if (call_id && this.relayInstance.callExists(call_id)) {
      console.log('Call already setupped!', call_id)
      // FIXME: using tag or park the first notification and then check on begin response
      return
    }
    this.id = call_id
    this.nodeId = node_id
    this._attachListeners()
    this.relayInstance.addCall(this)
    trigger(this.id, this, this.state, false)
    // console.log(`Call ${this.id} setupped!`)
  }

  async begin() {
    const { protocol, session } = this.relayInstance
    const msg = new Execute({
      protocol,
      method: 'call.begin',
      params: {
        device: this._device
      }
    })

    const response = await session.execute(msg).catch(error => error)
    const { result } = response
    if (!result) {
      logger.error('Begin call', response)
      throw new Error('Error creating the call')
    }
    const { call_id, code, node_id } = result
    if (code !== '200') {
      logger.error('Begin call not 200', call_id, code, node_id)
      throw new Error('Error creating the call')
    }

    this._init(result)
  }

  async hangup() {
    this._callIdRequired()
    const { protocol, session } = this.relayInstance
    const msg = new Execute({
      protocol,
      method: 'call.end',
      params: {
        node_id: this.nodeId,
        call_id: this.id,
        reason: DisconnectReason.Hangup
      }
    })

    const result = await session.execute(msg).catch(error => error)
    logger.debug('Hangup call:', result)
  }

  async answer() {
    this._callIdRequired()
    const { protocol, session } = this.relayInstance
    const msg = new Execute({
      protocol,
      method: 'call.answer',
      params: {
        node_id: this.nodeId,
        call_id: this.id
      }
    })

    const result = await session.execute(msg).catch(error => error)
    logger.debug('Answer call:', result)
  }

  async join(callsToJoin: Call | Call[]) { // TODO: wip
    this._callIdRequired()
    let calls = []
    if (callsToJoin instanceof Array) {
      calls = callsToJoin.map((c: Call) => c.id)
    } else if (callsToJoin instanceof Call) {
      calls = [callsToJoin.id]
    } else {
      throw new Error(`Unknow parameter type for join. ${callsToJoin}`)
    }
    if (!calls.length) {
      throw new Error('No Calls to join')
    }
    const { protocol, session } = this.relayInstance
    const msg = new Execute({
      protocol,
      method: 'call.join',
      params: {
        node_id: this.nodeId,
        call_id: this.id,
        calls
      }
    })

    const result = await session.execute(msg).catch(error => error)
    logger.debug('Join calls:', result)
  }

  async leave(callsToLeave: Call | Call[]) { // TODO: wip
    this._callIdRequired()
    let calls = []
    if (callsToLeave instanceof Array) {
      calls = callsToLeave.map((c: Call) => c.id)
    } else if (callsToLeave instanceof Call) {
      calls = [callsToLeave.id]
    } else {
      throw new Error(`Unknow parameter type for leave. ${callsToLeave}`)
    }
    if (!calls.length) {
      throw new Error('No Calls to leave')
    }
    const { protocol, session } = this.relayInstance
    const msg = new Execute({
      protocol,
      method: 'call.leave',
      params: {
        node_id: this.nodeId,
        call_id: this.id,
        calls
      }
    })

    const result = await session.execute(msg).catch(error => error)
    logger.debug('Join calls:', result)
  }

  async connect(...peers: any[]) { // FIXME: remove any[]
    this._callIdRequired()
    const devices = reduceConnectParams(peers, this.device)
    if (!devices.length) {
      throw new Error('No peers to connect!')
    }
    const { protocol, session } = this.relayInstance
    const msg = new Execute({
      protocol,
      method: 'call.connect',
      params: {
        node_id: this.nodeId,
        call_id: this.id,
        devices
      }
    })

    const response = await session.execute(msg).catch(error => error)
    const { result } = response
    if (!result) {
      logger.error('Connect call', response)
      throw new Error('Error connecting the call')
    }
    const { code } = result
    if (code !== '200') {
      throw result
    }
    const awaiter = await new Promise((resolve, reject) => {
      registerOnce(this.id, resolve.bind(this), CallConnectState.Connected)
      registerOnce(this.id, reject.bind(this), CallConnectState.Failed)
    })

    return awaiter
  }

  playAudio(location: string) {
    const params = { type: 'audio', params: { location } }
    return this.playMedia(params)
  }

  playVideo(location: string) {
    const params = { type: 'video', params: { location } }
    return this.playMedia(params)
  }

  playSilence(duration: number) {
    const params = { type: 'silence', params: { duration } }
    return this.playMedia(params)
  }

  playTTS(options: { text: string, language: string, gender: string, name: string }) {
    const { text = null, language = 'en-US', gender = 'male', name = 'bob' } = options
    if (!text) {
      throw new Error('"text" is required to play TTS.')
    }
    const params = { type: 'tts', params: { text, language, gender, name } }
    return this.playMedia(params)
  }

  async playMedia(...play: any[]) { // FIXME: remove any[]
    this._callIdRequired()
    if (!play.length) {
      throw new Error('No actions to play!')
    }
    this._mediaControlId = uuidv4()
    const { protocol, session } = this.relayInstance
    const msg = new Execute({
      protocol,
      method: 'call.play',
      params: {
        node_id: this.nodeId,
        call_id: this.id,
        control_id: this._mediaControlId,
        play
      }
    })

    const result = await session.execute(msg).catch(error => error)
    // TODO: handle error
    logger.debug('Play on call:', result)
  }

  async stopMedia() {
    this._callIdRequired()
    if (!this._mediaControlId) {
      throw new Error('There is no media to stop!')
    }
    const { protocol, session } = this.relayInstance
    const msg = new Execute({
      protocol,
      method: 'call.play.stop',
      params: {
        node_id: this.nodeId,
        call_id: this.id,
        control_id: this._mediaControlId
      }
    })

    const result = await session.execute(msg).catch(error => error)
    // TODO: handle error
    logger.debug('Stop media on call:', result)
  }

  get prevState() {
    return CallState[this._prevState]
  }

  get state() {
    return CallState[this._state]
  }

  get context() {
    return this.options.context
  }

  get peer(): Call {
    const { peer: { call_id = null } = {} } = this.options
    return this.relayInstance.getCall(call_id)
  }

  get device(): ICallDevice {
    return this.options.device
  }

  on(eventName: string, callback: Function) {
    const eventPermitted = CallState[eventName] && !isNaN(Number(CallState[eventName]))
    if (this.id && eventPermitted) {
      if (this._state >= CallState[eventName]) {
        callback(this)
      } else {
        registerOnce(this.id, callback, eventName)
      }
    }
    this._cbQueues[eventName] = callback
    return this
  }

  off(eventName: string, callback?: Function) {
    if (this.id) {
      deRegister(this.id, callback, eventName)
    }
    delete this._cbQueues[eventName]
    return this
  }

  private _onStateChange(newState: string) {
    this._prevState = this._state
    this._state = CallState[newState]
    if (this._cbQueues.hasOwnProperty(newState)) {
      this._cbQueues[newState](this)
    }
    return this
  }

  private _attachListeners() {
    registerOnce(this.id, this._detachListeners, CALL_STATES[CALL_STATES.length - 1])
    CALL_STATES.forEach(state => registerOnce(this.id, this._onStateChange.bind(this, state), state))
  }

  private _detachListeners() {
    CALL_STATES.forEach(state => deRegister(this.id, null, state))
  }

  private _callIdRequired() {
    if (!this.id) {
      throw new Error('Call has not started.')
    }
  }
}
