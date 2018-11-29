import logger from '../util/logger'
import { DialogOptions } from '../interfaces/'

const getUserMedia = async (constraints: MediaStreamConstraints) => {
  const stream = await navigator.mediaDevices.getUserMedia(constraints).catch(error => error)
  if (streamIsValid(stream)) {
    return stream
  }
  throw stream
}

const streamIsValid = stream => stream instanceof MediaStream

const getDevices = () => {
  // TODO: cache the devices in localStorage if available!
  return navigator.mediaDevices.enumerateDevices()
    // .catch(error => { logger.error('enumerateDevices Error', error) })
}

const resolutionList = [[160, 120], [320, 180], [320, 240], [640, 360], [640, 480], [1280, 720], [1920, 1080]]
const getResolutions = () => {
  resolutionList.forEach(async resolution => {
    const constraints = { audio: false, video: { width: { exact: resolution[0] }, height: { exact: resolution[1] } }}
    const stream = await getUserMedia(constraints)
      .catch(error => {
        logger.error('getUserMedia error?', error)
        return null
      })
    if (stream) {
      stream.getVideoTracks().forEach(t => {
        t.stop()
        const settings = t.getSettings()
        logger.info('%i x %i - deviceId: %s', resolution[0], resolution[1], settings.deviceId)
        logger.info('%i x %i - frameRate: %s', resolution[0], resolution[1], settings.frameRate)
        logger.info('%i x %i - height: %s', resolution[0], resolution[1], settings.height)
        logger.info('%i x %i - width: %s', resolution[0], resolution[1], settings.width)
      })
    }
  })
}

const getMediaConstraints = (options: DialogOptions): MediaStreamConstraints => {
  let { audio = true } = options
  if (options.hasOwnProperty('micId') && options.micId) {
    if (typeof audio === 'boolean') {
      audio = {}
    }
    audio['deviceId'] = { exact: options.micId }
  }

  let { video = false } = options
  if (options.hasOwnProperty('camId') && options.camId) {
    if (typeof video === 'boolean') {
      video = {}
    }
    video['deviceId'] = { exact: options.camId }
  }

  return { audio, video }
}

export {
  getUserMedia,
  getDevices,
  getResolutions,
  getMediaConstraints,
  streamIsValid
}
