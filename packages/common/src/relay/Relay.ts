import BaseSession from '../BaseSession'
import { Execute } from '../messages/Blade'
import { Setup } from '../services/Setup'
import logger from '../util/logger'

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
    if (this._protocol) {
      return
    }
    this._protocol = await Setup(this.session, this.service, this.notificationHandler.bind(this))
      .catch(error => {
        logger.error(`Error during setup ${this.service}.`, error)
        return null
      })
  }

  protected async configure() {
    if (!this._protocol) {
      throw new Error('No protocol to configure.')
    }
    // TODO: add 'resource' - 'domain' to ISignalWireOptions interface
    // @ts-ignore
    const { resource = 'swire', domain = 'dev.swire.io' } = this.session.options
    const msg = new Execute({ protocol: this._protocol, method: 'configure', params: { resource, domain } })
    const response = await this.session.execute(msg)
      .catch(error => {
        logger.error(`Error during configure ${this.service}.`, error)
        return null
      })
    console.log('Configure', response)
  }
}

export default Relay
