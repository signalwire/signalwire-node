import logger from '../../util/logger'
import Relay from '../Relay'
import { DialogOptions } from '../../util/interfaces'
import Dialog from '../../../../web/src/rtc/Dialog'
import BrowserSession from '../../../../web/src/BrowserSession'
import { Execute } from '../../messages/Blade'
import { Login } from '../../messages/Verto'
import VertoHandler from '../../../../web/src/services/VertoHandler'

export default class WebRTC extends Relay {
  service = 'webrtc'

  protected _configure: boolean = true

  constructor(public session: BrowserSession) {
    super(session)
  }

  notificationHandler(notification: any) {
    const { event_type, params } = notification
    // console.log('WebRTC notification', event_type, params)
    switch (event_type) {
      case 'webrtc.message':
        const handler = new VertoHandler(this.session)
        handler.handleMessage(params)
        break
    }
  }

  async makeCall(params: DialogOptions) {
    await this.setup()

    const msg = new Execute({
      protocol: this._protocol, method: 'message', params: {
        message: new Login('1008@dev.swire.io', '1234', null, {}).request
      }
    })

    const response = await this.session.execute(msg)
      .catch(error => {
        logger.error('SignalWire login error', error)
      })

    logger.info('webrtc makeCall', params)

    const { destinationNumber = null } = params
    if (!destinationNumber) {
      throw new Error('SignalWire.newCall() error: destinationNumber is required.')
    }
    const dialog = new Dialog(this.session, params)
    dialog.invite()
    return dialog
  }
}
