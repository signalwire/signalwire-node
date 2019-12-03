import Relay from './src/SignalWire'
import Verto from './src/Verto'
import { setAgentName } from '../common/src/messages/blade/Connect'

export const VERSION = '1.2.4'
setAgentName(`JavaScript SDK/${VERSION}`)

export {
  Relay,
  Verto
}
