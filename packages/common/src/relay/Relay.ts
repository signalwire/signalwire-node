import BaseSession from '../BaseSession'
import { Setup } from '../services/Setup'
import { deRegisterAll } from '../services/Handler'

abstract class Relay {
  [x: string]: any
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
  }

  destroy() {
    if (this.protocol) {
      deRegisterAll(this.protocol)
    }
  }
}

export default Relay
