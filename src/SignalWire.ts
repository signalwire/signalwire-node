import logger from './util/logger'
import Session from './services/Session'
import MessagingService from './services/MessagingService'
import CallingService from './services/CallingService'

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

  async sendSms(params: any) {
    const setup = await MessagingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping MessagingService.')
    }
    const result = await new MessagingService(this._session).sendSms(params)

    return result
  }

  async createCall(params: any) {
    const setup = await CallingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping CallingService.')
    }
    const result = await new CallingService(this._session).call(params)

    return result
  }


  async playFileOnCall(channel: string, url) {
    const setup = await CallingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping CallingService.')
    }
    const result = await new CallingService(this._session).play(channel, url)

    return result
  }

  async playDigitsOnCall(channel: string, digits: string, digit_duration: number = 80) {
    const setup = await CallingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping CallingService.')
    }
    const result = await new CallingService(this._session).playDigits(channel, digits, digit_duration)

    return result
  }

  async sayOnCall(channel: string, what: string, gender: string) {
    const setup = await CallingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping CallingService.')
    }
    const result = await new CallingService(this._session).say(channel, what, gender)

    return result
  }

  async answerCall(channel: string) {
    const setup = await CallingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping CallingService.')
    }
    const result = await new CallingService(this._session).answer(channel)

    return result
  }

  async collectDigitsOnCall(channel: string) {
    const setup = await CallingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping CallingService.')
    }
    const result = await new CallingService(this._session).collectDigits(channel)

    return result
  }

  async collectSpeechOnCall(channel: string) {
    const setup = await CallingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping CallingService.')
    }
    const result = await new CallingService(this._session).collectSpeech(channel)

    return result
  }

  async disconnectCall(channel: string) {
    const setup = await CallingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping CallingService.')
    }
    const result = await new CallingService(this._session).disconnect(channel)

    return result
  }

  statusSms(id: string) {
    // return this._session.statusSms(id)
  }
}

export default SignalWire