import PubSub from 'pubsub-js'
import logger from './util/logger'
import Session from './services/Session'
import MessagingService from './services/MessagingService'
import CallingService from './services/CallingService'
import { SIGNALWIRE_NOTIFICATIONS } from './util/constants'

interface ISignalWireOptions {
  host: string
  project: string
  token: string
  callbacks: {
    onSocketOpen?: (session: Session) => void
    onSocketClose?: (session: Session) => void
    onSocketError?: (session: Session) => void
    onMessageInbound?: (session: Session, result: any) => void
    onSessionReady?: (session: Session, error: any) => void
  }
}

class SignalWire {
  private _session: Session

  constructor(public options: ISignalWireOptions) {
    if (!this._validateOptions(options)) {
      logger.error('Invalid init params. "host" - "project" - "token" are required')
      return
    }
    this._init()
  }

  private _init() {
    this._session = new Session(this)
  }

  private _validateOptions(options: ISignalWireOptions): boolean {
    return (options.hasOwnProperty('host') && options.host !== '' &&
      options.hasOwnProperty('project') && options.project !== '' &&
      options.hasOwnProperty('token') && options.token !== '')
  }

  subscribe(protocol: string, channels: string[]) {
    return this._session.addSubscription(protocol, channels)
  }

  unsubscribe(protocol: string, channels: string[]) {
    return this._session.removeSubscription(protocol, channels)
  }

  async sendMessage(params: any) {
    const setup = await MessagingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping MessagingService.')
    }
    const result = await new MessagingService(this._session).sendSms(params)

    Object.defineProperty(result, 'onNotification', {
      value: callback => {
        logger.warn('Here to sub this message', result.id)
        PubSub.subscribe(`message_${result.id}`, callback)
      },
      writable: false
    })

    return result
  }

  async getMessage(params: any) {
    const setup = await MessagingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping MessagingService.')
    }
    let { messageId } = params
    const result = await new MessagingService(this._session).getMessage(messageId)

    return result
  }

  async createCall(params: any) {
    const setup = await CallingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping CallingService.')
    }
    const result = await new CallingService(this._session).call(params)

    Object.defineProperty(result, 'onNotification', {
      value: callback => {
        logger.warn('Here to sub this call', result.channel)
        PubSub.subscribe(`call_${result.channel}`, callback)
      },
      writable: false
    })

    return result
  }

  async hangupCall(params: any) {
    const setup = await CallingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping CallingService.')
    }
    const result = await new CallingService(this._session).hangup(params)

    return result
  }

  async playFileOnCall(params: any) {
    const setup = await CallingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping CallingService.')
    }
    const result = await new CallingService(this._session).play(params)

    return result
  }

  async sendDtmf(params: any) {
    const setup = await CallingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping CallingService.')
    }
    const result = await new CallingService(this._session).sendDtmf(params)

    return result
  }

  async sayOnCall(params: any) {
    const setup = await CallingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping CallingService.')
    }
    let { channel, what, gender } = params
    const result = await new CallingService(this._session).say(params)

    return result
  }

  async answerCall(params: any) {
    const setup = await CallingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping CallingService.')
    }
    const result = await new CallingService(this._session).answer(params)

    return result
  }

  async collectDigitsOnCall(params: any) {
    const setup = await CallingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping CallingService.')
    }
    const result = await new CallingService(this._session).collectDigits(params)

    return result
  }

  async collectSpeechOnCall(params: any) {
    const setup = await CallingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping CallingService.')
    }
    const result = await new CallingService(this._session).collectSpeech(params)

    return result
  }

  on(eventName: string, callback: any) {
    let found = Object.values(SIGNALWIRE_NOTIFICATIONS).find(v => v === eventName)
    if (!found) {
      throw new Error('Invalid event name: ' + eventName)
    }
    PubSub.subscribe(eventName, callback)
  }

  off(eventName: string) {
    PubSub.unsubscribe(eventName)
  }
}

export default SignalWire
