import { findElementByType } from '../util/helpers'

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
  attachMediaStream,
  detachMediaStream
}
