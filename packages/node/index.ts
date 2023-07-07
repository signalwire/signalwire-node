require('dotenv').config()
import { Client } from 'faye-websocket'
import RestClient from './src/rest'
import RelayClient from './src/relay'
import RelayConsumer from './src/relay/RelayConsumer'
import { setWebSocket } from '../common/src/services/Connection'
import Task from '../common/src/relay/tasking/Task'
import { setAgentName } from '../common/src/messages/blade/Connect'

export const VERSION = '2.6.0'
setAgentName(`Node.js SDK/${VERSION}`)
setWebSocket(Client)

export {
  RestClient,
  RelayClient,
  RelayConsumer,
  Task
}
