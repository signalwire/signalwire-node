import logger from '../util/logger'
import * as WebRTC from '../util/webrtc'
import { DeviceType } from './constants'

export const checkPermissions = async (kind: string = null) => {
  const devices: MediaDeviceInfo[] = await WebRTC.enumerateDevicesByKind(kind)
  if (!devices.length) {
    logger.warn(`No ${kind} devices to check for permissions!`)
    return null
  }
  return devices.every(({ deviceId, label }) => Boolean(deviceId && label))
}

export const checkVideoPermissions = () => checkPermissions(DeviceType.Video)
export const checkAudioPermissions = () => checkPermissions(DeviceType.AudioIn)

const _constraintsByKind = (kind: string = null): MediaStreamConstraints => {
  return {
    audio: !kind || kind === DeviceType.AudioIn || kind === DeviceType.AudioOut,
    video: !kind || kind === DeviceType.Video,
  }
}

/**
 * Retrieve device list using the browser APIs
 * It checks for permission to return valid deviceId and label
 */
export const getDevices = async (kind: string = null, fullList: boolean = false): Promise<MediaDeviceInfo[]> => {
  const hasPerms = await checkPermissions(kind)
  if (hasPerms === null) {
    // No devices at all
    return []
  } else if (hasPerms === false) {
    const constraints = _constraintsByKind(kind)
    const stream = await WebRTC.getUserMedia(constraints)
    WebRTC.stopStream(stream)
    return getDevices(kind)
  }
  let devices: MediaDeviceInfo[] = await WebRTC.enumerateDevicesByKind(kind)
  if (fullList === true) {
    return devices
  }
  const found = []
  devices = devices.filter(({ kind, groupId }) => {
    if (!groupId) {
      return true
    }
    const key = `${kind}-${groupId}`
    if (!found.includes(key)) {
      found.push(key)
      return true
    }
    return false
  })

  return devices
}

/**
 * Helper methods to get devices by kind
 */
export const getVideoDevices = () => getDevices(DeviceType.Video)
export const getAudioInDevices = () => getDevices(DeviceType.AudioIn)
export const getAudioOutDevices = () => getDevices(DeviceType.AudioOut)

/**
 * Scan a video deviceId by different resolutions
 */
const resolutionList = [[320, 240], [640, 360], [640, 480], [1280, 720], [1920, 1080]]
export const scanResolutions = async (deviceId: string) => {
  const supported = []
  const stream = await WebRTC.getUserMedia({ video: { deviceId: { exact: deviceId } } })
  const videoTrack = stream.getVideoTracks()[0]
  for (let i = 0; i < resolutionList.length; i++) {
    const [width, height] = resolutionList[i]
    const success = await videoTrack.applyConstraints({ width: { exact: width }, height: { exact: height } })
      .then(() => true)
      .catch(() => false)
    if (success) {
      supported.push({ resolution: `${width}x${height}`, width, height })
    }
  }
  WebRTC.stopStream(stream)

  return supported
}

/**
 * Assure a deviceId exists in the current device list from the browser.
 * It checks for deviceId or label - in case the UA changed the deviceId randomly
 */
export const assureDeviceId = async (id: string, label: string, kind: MediaDeviceInfo['kind']): Promise<string> => {
  const devices = await getDevices(kind, true)
  for (let i = 0; i < devices.length; i++) {
    const { deviceId, label: deviceLabel } = devices[i]
    if (id === deviceId || label === deviceLabel) {
      return deviceId
    }
  }

  return null
}

/**
 * Helper methods to assure a deviceId without asking the user the "kind"
 */
export const validateVideoDevice = (id: string, label: string) => assureDeviceId(id, label, DeviceType.Video)
export const validateAudioInDevice = (id: string, label: string) => assureDeviceId(id, label, DeviceType.AudioIn)
export const validateAudioOutDevice = (id: string, label: string) => assureDeviceId(id, label, DeviceType.AudioOut)

export const checkDeviceIdConstraints = async (id: string, label: string, kind: MediaDeviceInfo['kind'], constraints: MediaTrackConstraints) => {
  const { deviceId = null } = constraints
  if (deviceId === null && (id || label)) {
    const deviceId = await assureDeviceId(id, label, kind).catch(error => null)
    if (deviceId) {
      constraints.deviceId = { exact: deviceId }
    }
  }
  return constraints
}
