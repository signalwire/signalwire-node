import Relay from './src/Relay'
import Verto from '../js/src/Verto'
import { setAgentName } from '../common/src/messages/blade/Connect'

export const VERSION = '1.0.1'
setAgentName(`ReactNative SDK/${VERSION}`)

export {
  Relay, Verto
}
