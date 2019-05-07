// @ts-ignore
import { RTCPeerConnection, mediaDevices, MediaStream } from 'react-native-webrtc'
import { objEmpty } from '../helpers'
import logger from '../logger'

const _RTCPeerConnection = (config: RTCPeerConnectionConfig) => {
  const _config = objEmpty(config) ? null : config
  logger.info('_RTCPeerConnection', _config)
  return new RTCPeerConnection(_config)
}

const _getUserMedia = (constraints: MediaStreamConstraints) => mediaDevices.getUserMedia(constraints)

const _enumerateDevices = () => mediaDevices.enumerateDevices()

const streamIsValid = (stream: MediaStream) => stream && stream instanceof MediaStream

const getSupportedConstraints = () => ({})

const attachMediaStream = (htmlElementId: string, stream: MediaStream) => null
const detachMediaStream = (htmlElementId: string) => null

const sdpToJsonHack = sdp => {
  Object.defineProperty(sdp, 'toJSON', { value: () => sdp })
  return sdp
}

const stopStream = (stream: MediaStream) => {
  if (streamIsValid(stream)) {
    stream.getTracks().forEach(t => t.stop())
  }
  stream = null
}

export {
  _RTCPeerConnection as RTCPeerConnection,
  _getUserMedia as getUserMedia,
  _getUserMedia as getDisplayMedia,
  _enumerateDevices as enumerateDevices,
  getSupportedConstraints,
  streamIsValid,
  attachMediaStream,
  detachMediaStream,
  sdpToJsonHack,
  stopStream
}
