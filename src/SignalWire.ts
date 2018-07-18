import logger from './util/logger'
import Session from './services/Session'

interface ISignalWireOptions {
  authentication?: { project: string, token: string }
  socket: { address: string }
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
    if (!options.hasOwnProperty('socket') || !options.socket.hasOwnProperty('address')) {
      logger.error('socket.address not found.')
      return
    }
    this._init()
  }

  private _init() {
    this._session = new Session(this)
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