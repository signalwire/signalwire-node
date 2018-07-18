import logger from './util/logger'
import Session from './services/Session'

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

  sendSms(msgText: string, from: string, to: string) {
    return this._session.sendSms(msgText, from, to)
  }

  statusSms(id: string) {
    return this._session.statusSms(id)
  }
}

export default SignalWire