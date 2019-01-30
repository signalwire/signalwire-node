import logger from '../../util/logger'
import Calling from './Calling'
import { Execute } from '../../messages/Blade'
import { cleanNumber } from '../../util/helpers'

import { registerOnce, deRegister, trigger } from '../../services/Handler'
import { ICall, ICallOptions } from '../../interfaces'
import { CallState, DisconnectReason, CALL_STATES } from '../../util/constants/relay'

abstract class Call implements ICall {
  abstract type: string
  abstract beginParams: {}

  public id: string
  public nodeId: string

  private _prevState: number = 0
  private _state: number = 0
  private _cbQueues: { [state: string]: Function } = {}

  constructor(protected relayInstance: Calling, protected options: ICallOptions) {
    console.log('Creating a Call', options)
    this._attachListeners = this._attachListeners.bind(this)
    this._detachListeners = this._detachListeners.bind(this)
  }

  async begin() {
    const { protocol, session } = this.relayInstance
    const msg = new Execute({
      protocol,
      method: 'call.begin',
      params: {
        type: this.type,
        params: this.beginParams
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

  async join(callsToJoin: Call | Call[]) {
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

  get prevState() {
    return CallState[this._prevState]
  }

  get state() {
    return CallState[this._state]
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

  private _attachListeners() {
    // TODO: attach all listeners to update call state!
    registerOnce(this.id, this._detachListeners, CALL_STATES[CALL_STATES.length - 1])

    CALL_STATES
      .filter(state => this._cbQueues.hasOwnProperty(state))
      .forEach(state => registerOnce(this.id, this._cbQueues[state], state))
  }

  private _detachListeners() {
    CALL_STATES
      // .filter(state => this._cbQueues.hasOwnProperty(state))
      .forEach(state => deRegister(this.id, null, state))
  }
}

export class PhoneCall extends Call {
  type = 'phone'

  get beginParams() {
    const { from_number, to_number } = this.options
    return { from_number: cleanNumber(from_number), to_number: cleanNumber(to_number) }
  }
}

export class WebRtcCall extends Call {
  type = 'webrtc'

  get beginParams() {
    const { from_number, to_number } = this.options
    return { from_number: cleanNumber(from_number), to_number: cleanNumber(to_number) }
  }
}

export class SipCall extends Call {
  type = 'sip'

  get beginParams() {
    const { from_number, to_number } = this.options
    return { from_number: cleanNumber(from_number), to_number: cleanNumber(to_number) }
  }
}
