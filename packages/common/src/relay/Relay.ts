import BaseSession from '../BaseSession'
import { Execute } from '../messages/Blade'
import { Setup } from '../services/Setup'
import { registerOnce, deRegisterAll } from '../services/Handler'
import { SwEvent } from '../util/constants'

abstract class Relay {
  protected abstract service: string
  protected _protocol: string // TODO: public removing GETTER
  protected abstract notificationHandler(notification: any): void
  protected _configure: boolean = false

  constructor(public session: BaseSession) {
    registerOnce(SwEvent.Disconnect, this._disconnect.bind(this), this.session.uuid)
  }

  get protocol() {
    return this._protocol
  }

  async setup() {
    if (this._protocol) {
      return
    }
    this._protocol = await Setup(this.session, this.service, this.notificationHandler.bind(this))
    if (this._configure) {
      await this.configure()
    }
  }

  protected async configure() {
    // TODO: add 'resource' - 'domain' to ISignalWireOptions interface
    // @ts-ignore
    const { resource = 'swire', domain = 'dev.swire.io' } = this.session.options
    const msg = new Execute({ protocol: this._protocol, method: 'configure', params: { resource, domain } })
    await this.session.execute(msg)
      .catch(error => {
        throw error.result
      })
  }

  protected _disconnect() {
    if (this._protocol) {
      deRegisterAll(this._protocol)
    }
  }
}

export default Relay
