import 'react-native-get-random-values'
import Relay from './src/Relay'
import Verto from '../js/src/Verto'
import { setAgentName } from '../common/src/messages/blade/Connect'

export const VERSION = '1.0.3-rc.2'
setAgentName(`ReactNative SDK/${VERSION}`)

export {
  Relay, Verto
}

export * from '../common/src/util/interfaces'
export * from '../common/src/webrtc/interfaces'
