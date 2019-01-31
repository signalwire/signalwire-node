import logger from '../util/logger'
import * as Storage from '../util/storage'
import { isDefined } from '../util/helpers'
import { DialogOptions, ICacheDevices, ICacheResolution } from '../util/interfaces'

const getUserMedia = async (constraints: MediaStreamConstraints): Promise<MediaStream | null> => {
  logger.debug('RTCService.getUserMedia', constraints)
  const { audio, video } = constraints
  if (!audio && !video) {
    return null
  }
  const stream = await navigator.mediaDevices.getUserMedia(constraints).catch(error => error)
  if (streamIsValid(stream)) {
    return stream
  }
  logger.error('getUserMedia error: ', stream.name, stream.message)
  throw stream
}

const streamIsValid = (stream: MediaStream) => stream && stream instanceof MediaStream

const getDevices = async (): Promise<ICacheDevices> => {
  const devices = await navigator.mediaDevices.enumerateDevices()
    .catch(error => {
      logger.error('enumerateDevices Error', error)
      return null
    })
  const cache = {};
  ['videoinput', 'audioinput', 'audiooutput'].map((kind: string) => {
    cache[kind] = {}
    Object.defineProperty(cache[kind], 'toArray', {
      value: function () {
        return Object.keys(this).map(k => this[k])
      }
    })
  })
  if (devices) {
    devices.forEach((t: MediaDeviceInfo) => {
      if (!cache.hasOwnProperty(t.kind)) {
        logger.warn(`Unknown device type: ${t.kind}`, t)
        return true
      }
      if (t.groupId && Object.keys(cache[t.kind]).some(k => cache[t.kind][k].groupId == t.groupId)) {
        return true
      }
      cache[t.kind][t.deviceId] = t
    })
  }

  Storage.setItem('devices', cache)

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
      stream.getVideoTracks().forEach((t: MediaStreamTrack) => {
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
    audio.deviceId = { exact: options.micId }
  }

  let { video = false } = options
  if (options.hasOwnProperty('camId') && options.camId) {
    if (typeof video === 'boolean') {
      video = {}
    }
    video.deviceId = { exact: options.camId }
  }

  return { audio, video }
}

const assureDeviceId = async (id: string, label: string, kind: MediaDeviceInfo['kind']): Promise<string> => {
  const devices = await navigator.mediaDevices.enumerateDevices()
    .catch(error => { logger.error('enumerateDevices Error', error) })
  if (devices) {
    for (let i = 0; i < devices.length; i++) {
      const { deviceId, label: deviceLabel, kind: deviceKind } = devices[i]
      if (kind !== deviceKind || !/input$/.test(kind)) {
        continue
      }
      if ((id && id === deviceId) || (label && label === deviceLabel)) {
        return deviceId
      }
    }
  }
  return null
}

const checkPermissions = async (): Promise<boolean> => {
  const fullStream = await getUserMedia({ audio: true, video: true }).catch(_e => null)
  if (streamIsValid(fullStream)) {
    fullStream.getTracks().forEach((t: MediaStreamTrack) => t.stop())
  } else {
    const audioStream = await getUserMedia({ audio: true }).catch(_e => null)
    if (streamIsValid(audioStream)) {
      audioStream.getTracks().forEach((t: MediaStreamTrack) => t.stop())
    } else {
      return false
    }
  }
  return true
}

const removeUnsupportedConstraints = (constraints: MediaTrackConstraints): void => {
  const supported = navigator.mediaDevices.getSupportedConstraints()
  Object.keys(constraints).map(key => {
    if (!supported.hasOwnProperty(key)) {
      logger.warn(`"${key}" constraint is not supported in this browser!`)
      delete constraints[key]
    }
  })
}

const checkDeviceIdConstraints = async (id: string, label: string, kind: MediaDeviceInfo['kind'], constraints: MediaTrackConstraints) => {
  const { deviceId } = constraints
  if (!isDefined(deviceId) && (id || label)) {
    const deviceId = await assureDeviceId(id, label, kind).catch(error => null)
    if (deviceId) {
      constraints.deviceId = { exact: deviceId }
    } else {
      throw `Unknown device with id: '${id}' and label: '${label}'`
    }
  }
  return constraints
}

export {
  getUserMedia,
  getDevices,
  getResolutions,
  getMediaConstraints,
  streamIsValid,
  assureDeviceId,
  checkPermissions,
  removeUnsupportedConstraints,
  checkDeviceIdConstraints
}
