import Relay from './src/SignalWire'
import Verto from './src/Verto'
import { setAgentName } from '../common/src/messages/blade/Connect'
import CantinaAuth from '../common/src/webrtc/CantinaAuth'

export const VERSION = '1.5.0'
setAgentName(`JavaScript SDK/${VERSION}`)

export { Relay, Verto, CantinaAuth }

export * from '../common/src/util/interfaces'
