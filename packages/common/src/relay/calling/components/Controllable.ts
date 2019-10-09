import { BaseComponent } from './BaseComponent'
import { Execute } from '../../../messages/Blade'
import { StopResult } from '../results'

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

  async stop(): Promise<StopResult> {
    const result = await this._execute(`${this.method}.stop`)
    return new StopResult(result)
  }

  async pause<T>(ResultObject: new (b: boolean) => T): Promise<T> {
    const result = await this._execute(`${this.method}.pause`)
    return new ResultObject(result)
  }

  async resume<T>(ResultObject: new (b: boolean) => T): Promise<T> {
    const result = await this._execute(`${this.method}.resume`)
    return new ResultObject(result)
  }
}
