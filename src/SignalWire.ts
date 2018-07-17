import logger from './util/logger'
import Session from './services/Session'

class SignalWire {
  private _session: Session

  constructor(public authentication?: { project: string, token: string }) {
    this._init()
  }

  private _init() {
    this._session = new Session(this, () => {
      logger.info('SW Session Ready')
    })
  }
}
export default SignalWire