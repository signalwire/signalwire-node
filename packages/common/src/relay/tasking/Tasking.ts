import { register, trigger } from '../../services/Handler'
import logger from '../../util/logger'
import Relay from '../Relay'
import { TaskNotification } from '../../util/constants/relay'

const _ctxUniqueId = (context: string): string => `tasking.ctx.${context}`

export default class Tasking extends Relay {

  notificationHandler(notification: any) {
    const { event_type, context, message } = notification
    switch (event_type) {
      case TaskNotification.Receive:
        logger.info(`Receive task in context: ${context}`)
        trigger(this.session.relayProtocol, message, _ctxUniqueId(context))
        return
    }
  }

  onTask(context: string, handler: Function) {
    register(this.session.relayProtocol, handler, _ctxUniqueId(context))
  }
}
