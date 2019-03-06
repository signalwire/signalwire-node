import BaseSession from '../BaseSession'
import { Setup } from '../services/Setup'
import { registerOnce, deRegisterAll } from '../services/Handler'
import { SwEvent } from '../util/constants'

abstract class Relay {
  protected abstract service: string
  protected _protocol: string // TODO: public removing GETTER
  protected abstract notificationHandler(notification: any): void

  constructor(public session: BaseSession) {
    registerOnce(SwEvent.Disconnect, this._disconnect.bind(this), this.session.uuid)
  }

  get protocol() {
    return this._protocol
  }

  protected async setup() {
    if (!this._protocol) {
      this._protocol = await Setup(this.session, this.service, this.notificationHandler.bind(this))
    }
  }

  protected _disconnect() {
    if (this._protocol) {
      deRegisterAll(this._protocol)
    }
  }
}

export default Relay
