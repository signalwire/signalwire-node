import logger from '../util/logger'
import MessagingService from '../services/MessagingService'
import CallingService from '../services/CallingService'
import PubSub from 'pubsub-js'
import { SIGNALWIRE_NOTIFICATIONS } from '../util/constants'

export default class BroadcastService {
  constructor(public session: any) {}

  handleBroadcast(params: any) {
    let { protocol } = params
    let { services } = this.session
    let service = Object.keys(services).find(k => services[k] === protocol)
    if (typeof service === 'string' && service) { // It's a notification from a previous service
      let { params: subParams } = params
      switch (service) {
        case MessagingService.service:
          logger.debug('Notification from Message received:', params)
          this._publishNotification(`message_${subParams.id}`, SIGNALWIRE_NOTIFICATIONS.MESSAGES, subParams)
          break
        case CallingService.service:
          logger.debug('Notification from Call received:', params)
          this._publishNotification(`call_${subParams['Channel-Call-UUID']}`, SIGNALWIRE_NOTIFICATIONS.CALLS, subParams)
          break
        default:
          logger.debug('Unknown notification for protocol %s:', protocol, params)
      }
    } else {
      switch (protocol) {
        // case '':
        // break;
        default:
          logger.debug('Unknown broadcast received:', params)
      }
    }
  }

  private _publishNotification(uniqueName: string, globalName: string, params: any) {
    let published = PubSub.publish(uniqueName, params)
    if (!published) {
      PubSub.publish(globalName, params)
    } else {
      // TODO: on ended, remove the subscription!
      // PubSub.unsubscribe(uniqueName) if ended
    }
  }
}