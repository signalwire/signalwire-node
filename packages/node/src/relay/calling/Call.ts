import { v4 as uuidv4 } from 'uuid'
import { Execute } from '../../../../common/src/messages/Blade'
import { deRegister, registerOnce, trigger } from '../../../../common/src/services/Handler'
import { CallState, CallType, CALL_STATES, DisconnectReason } from '../../../../common/src/util/constants/relay'
import { cleanNumber } from '../../../../common/src/util/helpers'
import { ICall, ICallOptions } from '../../../../common/src/util/interfaces'
import logger from '../../../../common/src/util/logger'
import { detectCallType, reduceConnectParams } from '../helpers'
import Calling from './Calling'

export default class Call implements ICall {
  public id: string
  public nodeId: string
  public type: string
  public connectedWith: Call = null

  private _prevState: number = 0
  private _state: number = 0
  private _cbQueues: { [state: string]: Function } = {}
  private _from_number: string = ''
  private _to_number: string = ''
  private _timeout: number = 30
  private _mediaControlId: string = ''

  constructor(protected relayInstance: Calling, protected options: ICallOptions) {
    this._attachListeners = this._attachListeners.bind(this)
    this._detachListeners = this._detachListeners.bind(this)
    const { type, to_number } = options
    this.type = type ? type : detectCallType(to_number)
  }

  async begin() {
    const { protocol, session } = this.relayInstance
    const msg = new Execute({
      protocol,
      method: 'call.begin',
      params: {
        device: {
          type: this.type,
          params: this.beginParams
        }
      }
    })

    const response = await session.execute(msg).catch(error => error)
    const { result } = response
    if (!result) {
      logger.error('Begin call', response)
      throw 'Error creating the call'
    }
    const { call_id, code, node_id } = result
    if (code !== '200') {
      logger.error('Begin call not 200', call_id, code, node_id)
      throw 'Error creating the call'
    }
    this.id = call_id
    this.nodeId = node_id
    this._state = CallState.created
    this.relayInstance.addCall(this)
    this._attachListeners()

    trigger(this.id, null, this.state, false)
  }

  async hangup() {
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
    let calls = []
    if (callsToJoin instanceof Array) {
      calls = callsToJoin.map((c: Call) => c.id)
    } else if (callsToJoin instanceof Call) {
      calls = [callsToJoin.id]
    } else {
      throw `Unknow parameter type for join. ${callsToJoin}`
    }
    if (!calls.length) {
      throw `No Calls to join`
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
    let calls = []
    if (callsToLeave instanceof Array) {
      calls = callsToLeave.map((c: Call) => c.id)
    } else if (callsToLeave instanceof Call) {
      calls = [callsToLeave.id]
    } else {
      throw `Unknow parameter type for leave. ${callsToLeave}`
    }
    if (!calls.length) {
      throw `No Calls to leave`
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
    const devices = reduceConnectParams(peers, this._from_number, this._timeout)
    if (!devices.length) {
      throw `No peers to connect!`
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

    const result = await session.execute(msg).catch(error => error)
    logger.debug('Connect to calls:', result)
  }

  playAudio(location: string) {
    const params = [{ type: 'audio', params: { location } }]
    return this.playMedia(params)
  }

  playVideo(location: string) {
    const params = [{ type: 'video', params: { location } }]
    return this.playMedia(params)
  }

  playSilence(duration: number) {
    const params = [{ type: 'silence', params: { duration } }]
    return this.playMedia(params)
  }

  playTTS(options: { text: string, language: string, gender: string, name: string }) {
    const { text = null, language = 'en-US', gender = 'male', name = 'bob' } = options
    if (!text) {
      throw '"text" is required to play TTS.'
    }
    const params = [{ type: 'tts', params: { text, language, gender, name } }]
    return this.playMedia(params)
  }

  async playMedia(play: any[]) { // FIXME: remove any[]
    if (!play.length) {
      throw `No actions to play!`
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
    if (!this._mediaControlId) {
      throw `There is no media to stop!`
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

  get beginParams() {
    switch (this.type) {
      case CallType.Phone: {
        const { from_number, to_number, timeout = 30 } = this.options
        this._from_number = cleanNumber(from_number)
        this._to_number = cleanNumber(to_number)
        this._timeout = Number(timeout) || 30
        return { from_number: this._from_number, to_number: this._to_number, timeout: this._timeout }
      }
      case CallType.Sip: {
        // TODO: handle SIP params
        const { from_number, to_number, timeout = 30 } = this.options
        this._from_number = cleanNumber(from_number)
        this._to_number = cleanNumber(to_number)
        this._timeout = Number(timeout) || 30
        return { from_number: this._from_number, to_number: this._to_number, timeout: this._timeout }
      }
      case CallType.WebRTC: {
        // TODO: handle WebRTC params
        const { from_number, to_number, timeout = 30 } = this.options
        this._from_number = cleanNumber(from_number)
        this._to_number = cleanNumber(to_number)
        this._timeout = Number(timeout) || 30
        return { from_number: this._from_number, to_number: this._to_number, timeout: this._timeout }
      }
    }
    return {}
  }

  on(eventName: string, callback: Function) {
    const eventPermitted = CallState[eventName] && !isNaN(Number(CallState[eventName]))
    if (eventPermitted && this._state >= CallState[eventName]) {
      callback()
    } else if (eventPermitted && this.id) {
      registerOnce(this.id, callback, eventName)
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
}
