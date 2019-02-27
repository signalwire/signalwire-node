import BaseSession from '../BaseSession'
import { Execute } from '../messages/Blade'
import { Setup } from '../services/Setup'
import { registerOnce, deRegisterAll } from '../services/Handler'
import { SwEvent } from '../util/constants'
import logger from '../util/logger'

abstract class Relay {
  public Ready: Promise<string>
  public protocol: string

  protected abstract notificationHandler(notification: any): void

  abstract get service(): string

  constructor(public session: BaseSession) {
    this.Ready = new Promise(async resolve => {
      try {
        this.protocol = await Setup(this.session, this.service, this.notificationHandler.bind(this))
        resolve(this.protocol)
      } catch (error) {
        console.error(error)
      }
    })

    registerOnce(SwEvent.Disconnect, this._disconnect.bind(this), this.session.uuid)
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

  protected _disconnect() {
    if (this.protocol) {
      deRegisterAll(this.protocol)
    }
  }
}

export default Relay
