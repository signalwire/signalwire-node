import { BaseComponent } from './BaseComponent'
import { Execute } from '../../../messages/Blade'

export abstract class Controllable extends BaseComponent {

  private async _execute(method: string) {
    try {
      const msg = new Execute({
        protocol: this.call.relayInstance.session.relayProtocol,
        method,
        params: {
          node_id: this.call.nodeId,
          call_id: this.call.id,
          control_id: this.controlId
        }
      })
      await this.call._execute(msg)
      return true
    } catch (error) {
      return false
    }
  }

  stop() {
    return this._execute(`${this.method}.stop`)
  }

  async pause<T>(ResultObject: new (b: boolean) => T): Promise<T> {
    const success = await this._execute(`${this.method}.pause`)
    return new ResultObject(success)
   }

  async resume<T>(ResultObject: new (b: boolean) => T): Promise<T> {
    const success = await this._execute(`${this.method}.resume`)
    return new ResultObject(success)
  }
}
