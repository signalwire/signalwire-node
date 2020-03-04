import BrowserSession from '../../common/src/BrowserSession'
import { CallOptions } from '../../common/src/webrtc/interfaces'
import WebRTCCall from '../../common/src/webrtc/WebRTCCall'

export default class SignalWire extends BrowserSession {
  async newCall(options: CallOptions) {
    const { destinationNumber = null } = options
    if (!destinationNumber) {
      throw new TypeError('destinationNumber is required')
    }
    const call = new WebRTCCall(this, options)
    call.invite()
    return call
  }
}
