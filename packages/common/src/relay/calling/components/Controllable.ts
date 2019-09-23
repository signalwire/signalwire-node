import { BaseComponent } from './BaseComponent'
import { Execute } from '../../../messages/Blade'
import { BaseResult } from '../results/BaseResult'

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
      const result = await this.call._execute(msg)
      this.successful = true
      return result
    } catch (error) {
      this.terminate()
      return error
    }
  }

  stop() {
    return this._execute(`${this.method}.stop`)
  }

  async pause<T extends BaseResult>(ResultObject: new (c: BaseComponent) => T): Promise<T> {
    await this._execute(`${this.method}.pause`)
    return new ResultObject(this)
   }

  async resume<T>(ResultObject: new (c: BaseComponent) => T): Promise<T> {
    await this._execute(`${this.method}.resume`)
    return new ResultObject(this)
  }
}
