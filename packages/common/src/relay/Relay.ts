import BaseSession from '../BaseSession'
import { Execute } from '../messages/Blade'
import { Setup } from '../services/Setup'
import { registerOnce, deRegisterAll } from '../services/Handler'
import { SwEvent } from '../util/constants'

abstract class Relay {
  [x: string]: any
  public Ready: Promise<string>
  public protocol: string

  protected abstract notificationHandler(notification: any): void
  protected _configure: boolean = false

  abstract get service(): string

  constructor(public session: BaseSession) {
    this.Ready = new Promise(async resolve => {
      try {
        this.protocol = await Setup(this.session, this.service, this.notificationHandler.bind(this))
        if (this._configure) {
          await this.configure()
        }
        resolve(this.protocol)
      } catch (error) {
        console.error(error)
      }
    })

    registerOnce(SwEvent.Disconnect, this._disconnect.bind(this), this.session.uuid)
  }

  protected async configure() {
    const { resource, domain } = this.session.options
    const msg = new Execute({ protocol: this.protocol, method: 'configure', params: { resource, domain } })
    await this.session.execute(msg)
  }

  protected _disconnect() {
    if (this.protocol) {
      deRegisterAll(this.protocol)
    }
  }
}

export default Relay
