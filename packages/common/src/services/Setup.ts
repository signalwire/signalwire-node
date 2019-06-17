import BaseSession from '../BaseSession'
import { Execute } from '../messages/Blade'
import * as Storage from '../util/storage/'

const SETUP_PROTOCOL = 'signalwire'
const SETUP_METHOD = 'setup'
const SETUP_CHANNEL = 'notifications'

export const Setup = async (session: BaseSession, service: string, handler?: Function): Promise<string> => {
  const { project } = session.options
  const params: { service: string, protocol?: string } = { service }
  const _key = `${project}-${service}`
  const currentProtocol = await Storage.getItem(_key)
  if (currentProtocol) {
    params.protocol = currentProtocol
  }
  const be = new Execute({ protocol: SETUP_PROTOCOL, method: SETUP_METHOD, params })
  const { result: { protocol = null } = {} } = await session.execute(be)
  await session.subscribe({ protocol, channels: [SETUP_CHANNEL], handler })

  await Storage.setItem(_key, protocol)
  return protocol
}
