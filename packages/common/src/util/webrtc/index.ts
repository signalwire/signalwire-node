const { RTCPeerConnection } = window
const { getUserMedia, enumerateDevices, getSupportedConstraints } = navigator.mediaDevices

const streamIsValid = stream => stream instanceof MediaStream

export {
  RTCPeerConnection,
  getUserMedia,
  enumerateDevices,
  getSupportedConstraints,
  streamIsValid
}
