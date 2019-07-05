import BaseSession from '../../../common/src/BaseSession'
import Calling from '../../../common/src/relay/calling/Calling'

export default class RelayClient extends BaseSession {

  private _calling: Calling = null

  get calling(): Calling {
    if (!this._calling) {
      this._calling = new Calling(this)
    }
    return this._calling
  }
}
