import Relay from '../Relay'
import { CallOptions } from '../../util/interfaces'
import Call from '../../webrtc/Call'
import BrowserSession from '../../BrowserSession'
import VertoHandler from '../../webrtc/VertoHandler'

export default class WebRTC extends Relay {

  get service() {
    return 'webrtc'
  }

  constructor(public session: BrowserSession) {
    super(session)
  }

  notificationHandler(notification: any) {
    const { event_type, node_id, params } = notification
    // console.log('WebRTC notification', event_type, params)
    switch (event_type) {
      case 'webrtc.message':
        const handler = new VertoHandler(this.session)
        handler.nodeId = node_id
        handler.handleMessage(params)
        break
    }
  }

  async newCall(params: CallOptions) {
    await this.Ready

    const { destinationNumber = null } = params
    if (!destinationNumber) {
      throw new Error('SignalWire.newCall() error: destinationNumber is required.')
    }
    const call = new Call(this.session, params)
    call.invite()
    return call
  }
}
