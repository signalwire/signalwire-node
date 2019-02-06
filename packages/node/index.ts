require('dotenv').config()

import RestClient from './src/rest'
import SignalWire from './src/SignalWire'
import { monitorCallbackQueue } from '../common/src/services/Handler'
import { setWebSocket } from '../common/src/services/Connection'

import { Client } from 'faye-websocket'

setWebSocket(Client)

export {
  RestClient,
  SignalWire,
  monitorCallbackQueue
}
