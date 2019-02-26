import BaseSession from '../BaseSession'
import { Setup } from '../services/Setup'

abstract class Relay {
  protected abstract service: string
  protected _protocol: string // TODO: public removing GETTER
  protected abstract notificationHandler(notification: any): void

  constructor(public session: BaseSession) {
  }

  get protocol() {
    return this._protocol
  }

  protected async setup() {
    if (!this._protocol) {
      this._protocol = await Setup(this.session, this.service, this.notificationHandler.bind(this))
    }
  }
}

export default Relay
