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
      .then(bladeObj => {
        logger.debug('subscribe response?', bladeObj)
        return bladeObj
      })
      .catch(error => {
        logger.error('subscribe response?', error)
        return error
      })
  }

  unsubscribe(protocol: string, channels: string[]) {
    return this._session.removeSubscription(protocol, channels)
      .then(bladeObj => {
        logger.debug('unsubscribe response?', bladeObj)
        return bladeObj
      })
      .catch(error => {
        logger.error('unsubscribe response?', error)
        return error
      })
  }

  sendSms(msgText: string, from: string, to: string) {
    return this._session.sendSms(msgText, from, to)
      .then(bladeObj => {
        logger.debug('sendSms response?', bladeObj)
        return bladeObj
      })
      .catch(error => {
        logger.error('sendSms response?', error)
        return error
      })
  }
}

export default SignalWire