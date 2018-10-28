import logger from '../util/logger'
import { service as MessagingService } from './Messaging'
import { service as CallingService } from './Calling'
import PubSub from 'pubsub-js'
import { EVENTS } from '../util/constants'

export default class BroadcastService {
  constructor(public session: any) {}

  handleBroadcast(params: any) {
    const { protocol } = params
    const { services } = this.session
    const service = Object.keys(services).find(k => services[k] === protocol)
    if (typeof service === 'string' && service) { // It's a notification from a previous service
      const { params: subParams } = params
      switch (service) {
        case MessagingService:
          logger.debug('Notification from Message received:', params)
          this._publishNotification(`message_${subParams.id}`, EVENTS.MESSAGES, subParams)
          break
        case CallingService:
          logger.debug('Notification from Call received:', params)
          this._publishNotification(`call_${subParams['Channel-Call-UUID']}`, EVENTS.CALLS, subParams)
          break
        default:
          logger.debug('Unknown notification for protocol %s:', protocol, params)
      }
    } else {
      switch (protocol) {
        default:
          logger.debug('Unknown broadcast received:', params)
      }
    }
  }

  private _publishNotification(uniqueName: string, globalName: string, params: any) {
    const published = PubSub.publish(uniqueName, params)
    if (!published) {
      PubSub.publish(globalName, params)
    } else {
      // TODO: on ended, remove the subscription!
      // PubSub.unsubscribe(uniqueName) if ended
    }
  }
}
