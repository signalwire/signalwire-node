require('dotenv').config()

import RestClient from './src/rest'
import RelayClient from './src/relay'
import RelayConsumer from './src/relay/RelayConsumer'
import { setWebSocket } from '../common/src/services/Connection'

import { Client } from 'faye-websocket'

setWebSocket(Client)

export {
  RestClient,
  RelayClient,
  RelayConsumer
}
