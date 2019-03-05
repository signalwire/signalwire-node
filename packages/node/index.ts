require('dotenv').config()

import RestClient from './src/rest'
import RelayClient from './src/SignalWire'
import { setWebSocket } from '../common/src/services/Connection'

import { Client } from 'faye-websocket'

setWebSocket(Client)

export {
  RestClient,
  RelayClient
}
