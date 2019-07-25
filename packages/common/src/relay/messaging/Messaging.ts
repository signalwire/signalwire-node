import logger from '../../util/logger'
import { register, trigger } from '../../services/Handler'
import { MessageNotification } from '../../util/constants/relay'
import Relay from '../Relay'
import { Execute } from '../../messages/Blade'
import SendResult from './SendResult'
import Message from './Message'

export default class Messaging extends Relay {
  protected service: string = 'messaging'

  notificationHandler(notification: any) {
    const { event_type, params } = notification
    params.event_type = event_type
    switch (event_type) {
      case MessageNotification.State: {
        // TODO: to implement
        const message = new Message(params)
        logger.debug('Message state!!', message)
        break
      }
      case MessageNotification.Receive: {
        const message = new Message(params)
        trigger(this.session.relayProtocol, message, this._ctxUniqueId(message.context))
        break
      }
    }
  }

  async send(params: any): Promise<SendResult> {
    const msg = new Execute({
      protocol: this.session.relayProtocol,
      method: 'messaging.send',
      params
    })

    const response: any = await this.session.execute(msg)
    logger.debug('Send message response', response)
    return new SendResult(response)
  }

}
