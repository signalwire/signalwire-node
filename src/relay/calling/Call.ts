import logger from '../../util/logger'
import Calling from './Calling'
import { Execute } from '../../messages/Blade'
import { cleanNumber } from '../../util/helpers'

import { register, deRegister } from '../../services/Handler'
import { ICall } from '../../interfaces'
import { CallState, DisconnectReason } from '../../util/constants/relay'

abstract class Call implements ICall {
  abstract type: string
  abstract beginParams: {}

  public id: string

  private _prevState: number = 0
  private _state: number = 0

  constructor(protected relayInstance: Calling, protected options: any) {
    console.log('Creating a Call', options)
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

    const result = await session.execute(msg).catch(error => error)
    logger.debug('Begin call:', result)
  }

  async hangup() {
    const { protocol, session } = this.relayInstance
    const msg = new Execute({
      protocol,
      method: 'call.end',
      params: {
        node_id: '',
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
        node_id: '',
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
        node_id: '',
        call_id: this.id,
        calls
      }
    })

    const result = await session.execute(msg).catch(error => error)
    logger.debug('Join calls:', result)
  }

  get prevState() {
    return CallState[this._prevState].toLowerCase()
  }

  get state() {
    return CallState[this._state].toLowerCase()
  }

  on(eventName: string, callback: Function) {
    register(eventName, callback/*, this.uuid*/)
  }

  off(eventName: string, callback?: Function) {
    deRegister(eventName, callback/*, this.uuid*/)
  }
}

export class PhoneCall extends Call {
  type = 'phone'

  get beginParams() {
    const { from, to } = this.options
    return { from_number: cleanNumber(from), to_number: cleanNumber(to) }
  }
}

export class WebRtcCall extends Call {
  type = 'webrtc'

  get beginParams() {
    const { from, to } = this.options
    return { from_number: cleanNumber(from), to_number: cleanNumber(to) }
  }
}

export class SipCall extends Call {
  type = 'sip'

  get beginParams() {
    const { from, to } = this.options
    return { from_number: cleanNumber(from), to_number: cleanNumber(to) }
  }
}
