import SignalWire from './SignalWireNode'
import { monitorCallbackQueue } from './services/Handler'
import { setWebSocket } from './Connection'

import { Client } from 'faye-websocket'

setWebSocket(Client)

export {
  SignalWire,
  monitorCallbackQueue
}
