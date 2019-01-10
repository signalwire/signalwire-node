import logger from '../util/logger'
import { DialogOptions, ICacheDevices, ICacheResolution } from '../interfaces/'

const getUserMedia = async (constraints: MediaStreamConstraints) => {
  logger.debug('RTCService.getUserMedia', constraints)
  const { audio, video } = constraints
  if (!audio && !video) {
    return null
  }
  const stream = await navigator.mediaDevices.getUserMedia(constraints).catch(error => error)
  if (streamIsValid(stream)) {
    return stream
  }
  logger.error('RTCService.getUserMedia', stream)
  throw stream
}

const streamIsValid = (stream: MediaStream) => stream && stream instanceof MediaStream

// TODO: cache the devices in localStorage if available!
const getDevices = async (): Promise<ICacheDevices> => {
  const devices = await navigator.mediaDevices.enumerateDevices()
    .catch(error => { logger.error('enumerateDevices Error', error) })
  const cache = {}
  if (devices) {
    devices.forEach(t => {
      if (!cache.hasOwnProperty(t.kind)) {
        cache[t.kind] = {}
      }
      if (t.groupId && Object.keys(cache[t.kind]).some(k => cache[t.kind][k].groupId == t.groupId)) {
        return true
      }
      cache[t.kind][t.deviceId] = t
    })
  }
  return cache
}

const resolutionList = [[160, 120], [176, 144], [320, 240], [352, 288], [640, 360], [640, 480], [800, 600], [1280, 720], [1600, 1200], [1920, 1080], [3840, 2160]]
const getResolutions = async (): Promise<ICacheResolution[]> => {
  const supported = []
  for (let i = 0; i < resolutionList.length; i++) {
    const resolution = resolutionList[i]
    const constraints = { audio: false, video: { width: { exact: resolution[0] }, height: { exact: resolution[1] } } }
    const stream = await getUserMedia(constraints).catch(error => null)
    if (stream) {
      stream.getVideoTracks().forEach(t => {
        supported.push(Object.assign({ resolution: `${resolution[0]}x${resolution[1]}` }, t.getSettings()))
        t.stop()
      })
    }
  }
  return supported
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
