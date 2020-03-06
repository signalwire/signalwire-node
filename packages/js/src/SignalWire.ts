import BrowserSession from '../../common/src/BrowserSession'
import { CallOptions } from '../../common/src/webrtc/interfaces'
import Call from '../../common/src/webrtc/Call'

export default class SignalWire extends BrowserSession {
  async newCall(options: CallOptions) {
    const { destinationNumber = null } = options
    if (!destinationNumber) {
      throw new TypeError('destinationNumber is required')
    }
    const call = new Call(this, options)
    call.invite()
    return call
  }
}
