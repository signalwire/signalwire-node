import logger from '../logger'

const _getElement = (id: string): HTMLMediaElement => {
  if (!id || typeof document !== 'object' || !('getElementById' in document)) {
    return null
  }
  const element = <HTMLMediaElement>document.getElementById(id)
  if (!element) {
    logger.warn(`Unknown HTML element with id ${id}.`)
    return null
  }
  return element
}

const attachMediaStream = (htmlElementId: string, stream: MediaStream) => {
  const element = _getElement(htmlElementId)
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

const detachMediaStream = (htmlElementId: string) => {
  const element = _getElement(htmlElementId)
  if (element === null) {
    return
  }
  element.srcObject = null
}

export {
  attachMediaStream,
  detachMediaStream
}
