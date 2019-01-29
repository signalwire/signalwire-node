import SignalWire from '../SignalWire'
import { Setup } from '../services/Setup';
import logger from '../util/logger';

// import { v4 as uuidv4 } from 'uuid'

abstract class Relay {
  protected abstract service: string
  protected _protocol: string // TODO: public removing GETTER

  constructor(public session: SignalWire) {
    this.notificationHandler = this.notificationHandler.bind(this)
  }

  get protocol() {
    return this._protocol
  }

  notificationHandler(data: any) {
    logger.warn(`Relay ${this.service} notification on proto ${this._protocol}`, data)
  }

  protected async setup() {
    if (!this._protocol) {
      this._protocol = await Setup(this.session, this.service, this.notificationHandler)
    }
  }
}

export default Relay
