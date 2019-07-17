import { register, trigger } from '../../services/Handler'
import logger from '../../util/logger'
import Relay from '../Relay'

const _ctxUniqueId = (context: string): string => `tasking.ctx.${context}`

export default class Tasking extends Relay {

  notificationHandler(notification: any) {
    const { context, message } = notification
    logger.info(`Receive task in context: ${context}`)
    trigger(this.session.relayProtocol, message, _ctxUniqueId(context))
  }

  onTask(context: string, handler: Function) {
    register(this.session.relayProtocol, handler, _ctxUniqueId(context))
  }
}
