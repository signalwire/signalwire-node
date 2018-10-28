import logger from '../util/logger'
import Session from '../Session'
import { Execute } from '../blade/Blade'

const SETUP_PROTOCOL = 'signalwire'
const SETUP_METHOD = 'setup'
const SETUP_CHANNEL = 'notifications'

export const Setup = async (session: Session, service: string) => {
  // Check if service is ready
  if (session.services.hasOwnProperty(service)) {
    logger.debug(service, ' has already been setup!')
    return true
  }
  logger.debug('Execute setup for', service)
  const be = new Execute({ protocol: SETUP_PROTOCOL, method: SETUP_METHOD, params: { service } })
  const response = await session.execute(be)
    .catch(error => {
      // TODO: The error is already throw by Session but here i want to dispatch a specific error
      logger.error('Setup error', error)
    })
  if (response === undefined) {
    throw new Error('Setup Error: invalid execute!')
  }
  const { protocol } = response.result.result

  logger.debug('Subscribe to ', protocol)
  const sub = await session.addSubscription(protocol, [SETUP_CHANNEL])
    .catch(error => {
      // TODO: The error is already throw by Session but here i want to dispatch a specific error
      logger.error('Setup subscription error', error)
    })
  if (sub === undefined) {
    throw new Error('Setup Error: invalid subscription!')
  }

  // FIXME: save service-protocol somewhere
  session.services[service] = protocol

  return true
}
