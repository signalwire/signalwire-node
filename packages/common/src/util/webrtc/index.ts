import { findElementByType } from '../helpers'

const RTCPeerConnection = (config: RTCPeerConnectionConfig) => new window.RTCPeerConnection(config)

const getUserMedia = (constraints: MediaStreamConstraints) => navigator.mediaDevices.getUserMedia(constraints)

const enumerateDevices = () => navigator.mediaDevices.enumerateDevices()

const getSupportedConstraints = () => navigator.mediaDevices.getSupportedConstraints()

const streamIsValid = stream => stream instanceof MediaStream

const attachMediaStream = (tag: any, stream: MediaStream) => {
  const element = findElementByType(tag)
  if (element === null) {
    return
  }
  if (!element.getAttribute('autoplay')) {
    element.setAttribute('autoplay', 'autoplay')
  }
  if (!element.getAttribute('playsinline')) {
    element.setAttribute('playsinline', 'playsinline')
  }
  element.srcObject = stream
}

const detachMediaStream = (tag: any) => {
  const element = findElementByType(tag)
  if (element) {
    element.srcObject = null
  }
}

const sdpToJsonHack = sdp => sdp

export {
  RTCPeerConnection,
  getUserMedia,
  enumerateDevices,
  getSupportedConstraints,
  streamIsValid,
  attachMediaStream,
  detachMediaStream,
  sdpToJsonHack
}
