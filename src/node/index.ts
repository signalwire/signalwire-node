require('dotenv').config()

import RestClient from './RestClient'
import SignalWire from './SignalWire'
import { monitorCallbackQueue } from '../services/Handler'
import { setWebSocket } from '../services/Connection'

import { Client } from 'faye-websocket'

setWebSocket(Client)

export {
  RestClient,
  SignalWire,
  monitorCallbackQueue
}
