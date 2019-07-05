import logger from '../util/logger'
import BaseSession from '../BaseSession'
import { Execute } from '../messages/Blade'
import { sessionStorage } from '../util/storage/'

const SETUP_PROTOCOL = 'signalwire'
const SETUP_METHOD = 'setup'
const SETUP_CHANNEL = 'notifications'

export default async (session: BaseSession): Promise<string> => {
  // TODO: service as an empty string for now. Remove it accordingly to Blade changes
  const params: { service: '', protocol?: string } = { service: '' }
  const storageKey = `${session.options.project}-setup`
  const currentProtocol = await sessionStorage.getItem(storageKey)
  if (currentProtocol) {
    params.protocol = currentProtocol
  }
  const be = new Execute({ protocol: SETUP_PROTOCOL, method: SETUP_METHOD, params })
  const { protocol = null } = await session.execute(be)
  if (!protocol) {
    await session.subscribe({ protocol, channels: [SETUP_CHANNEL] })
    await sessionStorage.setItem(storageKey, protocol)
  } else {
    logger.error('Error during setup the session protocol.')
  }

  return protocol
}
