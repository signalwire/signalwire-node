import BaseSession from '../../../common/src/BaseSession'
import Calling from '../../../common/src/relay/calling/Calling'
import Connection from '../../../common/src/services/Connection'

export default class RelayClient extends BaseSession {
  async connect(): Promise<void> {
    super.setup()
    this.connection = new Connection(this)
  }

  get calling() {
    return this._addRelayInstance('calling', Calling)
  }
}
