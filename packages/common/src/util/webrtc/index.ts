import { findElementByType } from '../helpers'

const { RTCPeerConnection } = window
const { getUserMedia, enumerateDevices, getSupportedConstraints } = navigator.mediaDevices

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

export {
  RTCPeerConnection,
  getUserMedia,
  enumerateDevices,
  getSupportedConstraints,
  streamIsValid,
  attachMediaStream,
  detachMediaStream
}
