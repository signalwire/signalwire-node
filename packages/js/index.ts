import Relay from './src/SignalWire'
import Verto from './src/Verto'
import { setAgentName } from '../common/src/messages/blade/Connect'
import CantinaAuth from '../common/src/webrtc/CantinaAuth'
import VertoConference from '../common/src/webrtc/Conference'

export const VERSION = '1.3.0-cantina.51'
setAgentName(`JavaScript SDK/${VERSION}`)

export {
  Relay,
  Verto,
  CantinaAuth,
  VertoConference,
}

export * from '../common/src/webrtc/deviceHelpers'

export * from '../common/src/util/interfaces'
export * from '../common/src/webrtc/interfaces'
