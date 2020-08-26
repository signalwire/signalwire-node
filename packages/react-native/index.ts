import 'react-native-get-random-values'
import Relay from './src/Relay'
import Verto from '../js/src/Verto'
import { setAgentName } from '../common/src/messages/blade/Connect'
import CantinaAuth from '../common/src/webrtc/CantinaAuth'

export const VERSION = '1.1.0-alpha.4'

setAgentName(`ReactNative SDK/${VERSION}`)

export {
  Relay,
  Verto,
  CantinaAuth,
}

export * from '../common/src/webrtc/deviceHelpers'

export * from '../common/src/util/interfaces'
export * from '../common/src/webrtc/interfaces'
