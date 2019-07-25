import BaseSession from '../BaseSession'
import { register } from '../services/Handler'
import Receive from '../services/Receive'

export default abstract class Relay {

  protected abstract service: string

  constructor(public session: BaseSession) {

  }

  async registerContexts(contexts: string | string[], handler: Function) {
    if (typeof contexts === 'string') {
      contexts = [contexts]
    }

    const success = await Receive(this.session, contexts)
    if (success) {
      contexts.forEach(context => register(this.session.relayProtocol, handler, this._ctxUniqueId(context)))
    }
    return success
  }

  protected _ctxUniqueId(context: string): string {
    return `${this.service}.ctx.${context}`
  }
}
