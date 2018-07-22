import logger from '../util/logger'
import MessagingService from '../services/MessagingService'

export default class BroadcastService {
  constructor(public session: any) {}

  handleBroadcast(params: any) {
    let { protocol } = params
    let { services } = this.session
    let service = Object.keys(services).find(k => services[k] === protocol)
    if (typeof service === 'string' && service) { // It's a notification from a previous service
      switch (service) {
        case MessagingService.service:
          logger.debug('Notification from Message received:', params)

          let { params: subParams } = params
          if (this.session.servicesCallback.hasOwnProperty(subParams.id)) {
            this.session.servicesCallback[subParams.id](subParams)
            if (subParams.status === 'delivered') { // Cleanup when SMS has been sent
              delete this.session.servicesCallback[subParams.id]
            }
          }
        break;
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
}