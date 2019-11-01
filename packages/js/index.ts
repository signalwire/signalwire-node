import Relay from './src/SignalWire'
import Verto from './src/Verto'
import { setAgentName } from '../common/src/messages/blade/Connect'

setAgentName(`JavaScript SDK/${require('./package.json').version}`)

export {
  Relay,
  Verto
}
