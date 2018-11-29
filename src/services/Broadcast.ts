import logger from '../util/logger'
import SignalWire from '../SignalWire'
import { service as MessagingService } from './Messaging'
import { service as CallingService } from './Calling'
import { trigger } from './Handler'
import { SwEvent } from '../util/constants'

export const BroadcastHandler = (session: SignalWire, params: any) => {
  const { protocol } = params
  const { services } = session
  const service = Object.keys(services).find(k => services[k] === protocol)
  if (typeof service === 'string' && service) { // It's a notification from a previous service
    const { params: subParams } = params
    switch (service) {
      case MessagingService:
        // FIXME: on ended, remove the subscription!
        logger.debug('Notification from Message:', params)
        if (!trigger(subParams.id, subParams)) {
          trigger(SwEvent.Messages, subParams)
        }
        break
      case CallingService:
        // FIXME: on ended, remove the subscription!
        logger.debug('Notification from Call:', params)
        if (!trigger(subParams['Channel-Call-UUID'], subParams)) {
          trigger(SwEvent.Calls, subParams)
        }
        break
      default:
        logger.debug('Unknown service: %s for protocol: %s', service, protocol, params)
    }
  } else {
    switch (protocol) {
      default:
        logger.debug('Unknown blade.broadcast received:', params)
    }
  }
}
