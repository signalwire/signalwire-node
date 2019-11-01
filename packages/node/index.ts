require('dotenv').config()

import RestClient from './src/rest'
import RelayClient from './src/relay'
import RelayConsumer from './src/relay/RelayConsumer'
import { setWebSocket } from '../common/src/services/Connection'
import Task from '../common/src/relay/tasking/Task'
import { setAgentName } from '../common/src/messages/blade/Connect'

import { Client } from 'faye-websocket'

setAgentName(`Node.js SDK/${require('./package.json').version}`)
setWebSocket(Client)

export {
  RestClient,
  RelayClient,
  RelayConsumer,
  Task
}
