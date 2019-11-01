import Relay from './src/Relay'
import Verto from '../js/src/Verto'
import { setAgentName } from '../common/src/messages/blade/Connect'

setAgentName(`ReactNative SDK/${require('./package.json').version}`)

export {
  Relay, Verto
}
