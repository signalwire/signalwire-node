// @ts-ignore
import { RTCPeerConnection, mediaDevices, getUserMedia, MediaStream, RTCSessionDescription } from 'react-native-webrtc'
import { objEmpty } from '../helpers'
import logger from '../logger'

const _RTCPeerConnection = (config: RTCPeerConnectionConfig) => {
  const _config = objEmpty(config) ? null : config
  logger.info('_RTCPeerConnection', _config)
  return new RTCPeerConnection(_config)
}


const _enumerateDevices = () => mediaDevices.enumerateDevices()

const streamIsValid = stream => stream instanceof MediaStream

const getSupportedConstraints = () => ({})

const attachMediaStream = (htmlElementId: string, stream: MediaStream) => null
const detachMediaStream = (htmlElementId: string) => null

const sdpToJsonHack = sdp => {
  Object.defineProperty(sdp, 'toJSON', {
    writable: false,
    value: () => sdp
  })

  return sdp
}

export {
  _RTCPeerConnection as RTCPeerConnection,
  getUserMedia,
  _enumerateDevices as enumerateDevices,
  getSupportedConstraints,
  streamIsValid,
  attachMediaStream,
  detachMediaStream,
  sdpToJsonHack
}
