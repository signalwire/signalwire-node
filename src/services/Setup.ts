import logger from '../util/logger'
// import SignalWire from '../SignalWire'
import BaseSession from '../BaseSession'
import { Execute } from '../messages/Blade'

const SETUP_PROTOCOL = 'signalwire'
const SETUP_METHOD = 'setup'
const SETUP_CHANNEL = 'notifications'

export const Setup = async (session: BaseSession, service: string, handler?: Function): Promise<string> => {
  logger.debug('Execute setup for', service)
  const be = new Execute({ protocol: SETUP_PROTOCOL, method: SETUP_METHOD, params: { service } })
  const { result: { protocol = null } = {} } = await session.execute(be).catch(error => error)
  if (protocol === null) {
    // TODO: throw a specific SignalWire error
    throw new Error('Setup Error: invalid execute!')
  }
  logger.debug('Subscribe to', protocol)
  const { subscribe_channels = [], failed_channels = [] } = await session.subscribe({ protocol, channels: [SETUP_CHANNEL], handler }).catch(error => error)
  if (failed_channels.length || subscribe_channels.indexOf(SETUP_CHANNEL) < 0) {
    throw new Error('Setup Error: invalid subscription to notifications channel!')
  }

  return protocol
}
