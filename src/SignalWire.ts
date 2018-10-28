import PubSub from 'pubsub-js'
import logger from './util/logger'
import Session from './Session'
import * as Messaging from './services/Messaging'
import * as Calling from './services/Calling'
import { ISignalWireOptions } from './interfaces'
import { validateOptions, registerHandler, removeHandler } from './util/helpers'

export default class SignalWire {
  private _session: Session

  constructor(public options: ISignalWireOptions) {
    if (!validateOptions(options)) {
      throw new Error('Invalid init params. "host" - "project" - "token" are required')
    }

    this._session = new Session(this)
  }

  connect() {
    return this._session.connect()
  }

  subscribe(protocol: string, channels: string[]) {
    return this._session.addSubscription(protocol, channels)
  }

  unsubscribe(protocol: string, channels: string[]) {
    return this._session.removeSubscription(protocol, channels)
  }

  async sendMessage(params: any) {
    const result = await Messaging.sendMessage(this._session, params)

    Object.defineProperty(result, 'onNotification', {
      writable: false,
      value: callback => {
        logger.warn('Here to sub this message', result.id)
        PubSub.subscribe(result.id, callback)
      }
    })

    return result
  }

  getMessage(params: any) {
    const { messageId } = params
    return Messaging.getMessage(this._session, messageId)
  }

  async createCall(params: any) {
    const result = await Calling.newCall(this._session, params)

    Object.defineProperty(result, 'onNotification', {
      writable: false,
      value: callback => {
        logger.warn('Here to sub this call', result.channel)
        PubSub.subscribe(result.channel, callback)
      }
    })

    return result
  }

  hangupCall(params: any) {
    return Calling.hangup(this._session, params)
  }

  playFileOnCall(params: any) {
    return Calling.play(this._session, params)
  }

  sendDtmf(params: any) {
    return Calling.sendDtmf(this._session, params)
  }

  sayOnCall(params: any) {
    return Calling.say(this._session, params)
  }

  answerCall(params: any) {
    return Calling.answer(this._session, params)
  }

  collectDigitsOnCall(params: any) {
    return Calling.collectDigits(this._session, params)
  }

  collectSpeechOnCall(params: any) {
    return Calling.collectSpeech(this._session, params)
  }

  on(eventName: string, callback: any) {
    registerHandler(eventName, callback, this._session.sessionid)
  }

  off(eventName: string) {
    removeHandler(eventName, this._session.sessionid)
  }

  static on(eventName: string, callback: any) {
    registerHandler(eventName, callback)
  }

  static off(eventName: string) {
    removeHandler(eventName)
  }
}
