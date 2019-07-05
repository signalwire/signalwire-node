import BaseSession from '../../../common/src/BaseSession'
import Calling from '../../../common/src/relay/calling/Calling'
import Connection from '../../../common/src/services/Connection'

export default class RelayClient extends BaseSession {

  private _calling: Calling = null

  async connect(): Promise<void> {
    super.setup()
    this.connection = new Connection(this)
  }

  get calling(): Calling {
    if (!this._calling) {
      this._calling = new Calling(this)
    }
    return this._calling
  }
}
