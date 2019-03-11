import BaseSession from '../../../common/src/BaseSession'
import Calling from '../../../common/src/relay/calling/Calling'
import Connection from '../../../common/src/services/Connection'

export default class extends BaseSession {
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
}
