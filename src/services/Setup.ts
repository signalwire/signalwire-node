import logger from '../util/logger'
import SignalWire from '../SignalWire'
import { Execute } from '../messages/Blade'

const SETUP_PROTOCOL = 'signalwire'
const SETUP_METHOD = 'setup'
const SETUP_CHANNEL = 'notifications'

export const Setup = async (session: SignalWire, service: string, handler?: Function): Promise<boolean> => {
  // Check if service is ready
  if (session.services.hasOwnProperty(service)) {
    logger.debug(service, ' has already been setup!')
    return true
  }
  logger.debug('Execute setup for', service)
  const be = new Execute({ protocol: SETUP_PROTOCOL, method: SETUP_METHOD, params: { service } })
  const { result: { protocol = null } = {} } = await session.execute(be).catch(error => error)
  if (protocol === null) {
    // TODO: throw a specific SignalWire error
    throw new Error('Setup Error: invalid execute!')
  }
  logger.debug('Subscribe to', protocol)
  const sub = await session.subscribe({ protocol, channels: [SETUP_CHANNEL], handler }).catch(error => error)
  logger.debug('Subscribe response', sub)
  if (sub === undefined) {
    throw new Error('Setup Error: invalid subscription!')
  }

  // FIXME: save service-protocol somewhere
  session.services[service] = protocol

  return true
}
