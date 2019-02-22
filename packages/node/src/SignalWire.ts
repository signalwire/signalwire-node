import BaseSession from '../../common/src/BaseSession'
import { deRegisterAll } from '../../common/src/services/Handler'
import Calling from './relay/calling/Calling'
import Connection from '../../common/src/services/Connection'

export default class SignalWire extends BaseSession {
  private _callingInstance: Calling = null

  async connect(): Promise<void> {
    super.setup()
    this.connection = new Connection(this)
  }

  get calling() {
    if (this._callingInstance === null) {
      this._callingInstance = new Calling(this)
    }
    return this._callingInstance
  }

  protected async _onDisconnect() {
    // TODO: sent unsubscribe for all subscriptions?
    deRegisterAll(this.calling.protocol)
  }
}
