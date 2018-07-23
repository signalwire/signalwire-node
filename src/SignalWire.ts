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

  async sendMessage(params: any) {
    const setup = await MessagingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping MessagingService.')
    }
    const result = await new MessagingService(this._session).sendSms(params)

    return result
  }

  async statusMessage(params: any) {
    const setup = await MessagingService.setup(this._session)
    if (setup === false) {
      throw new Error('Failed to bootstrapping MessagingService.')
    }
    let { smsId } = params
    const result = await new MessagingService(this._session).statusSms(smsId)

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
    let { channel, whatToSay, gender } = params
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
}

export default SignalWire