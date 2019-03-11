import BaseSession from '../BaseSession'
import { Execute } from '../messages/Blade'

const SETUP_PROTOCOL = 'signalwire'
const SETUP_METHOD = 'setup'
const SETUP_CHANNEL = 'notifications'

export const Setup = async (session: BaseSession, service: string, handler?: Function): Promise<string> => {
  const be = new Execute({ protocol: SETUP_PROTOCOL, method: SETUP_METHOD, params: { service } })
  const { result: { protocol = null } = {} } = await session.execute(be)
  await session.subscribe({ protocol, channels: [SETUP_CHANNEL], handler })

  return protocol
}
