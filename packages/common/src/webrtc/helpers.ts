import logger from '../util/logger'
import { localStorage } from '../util/storage'
import * as WebRTC from '../util/webrtc'
import { isDefined } from '../util/helpers'
import { CallOptions, ICacheDevices } from '../util/interfaces'
import { stopStream } from '../util/webrtc'

const getUserMedia = async (constraints: MediaStreamConstraints): Promise<MediaStream | null> => {
  logger.info('RTCService.getUserMedia', constraints)
  const { audio, video } = constraints
  if (!audio && !video) {
    return null
  }
  try {
    return await WebRTC.getUserMedia(constraints)
  } catch (error) {
    logger.error('getUserMedia error: ', error)
    throw error
  }
}

const getDevices = async (): Promise<ICacheDevices> => {
  const cache = {};
  ['videoinput', 'audioinput', 'audiooutput'].map((kind: string) => {
    cache[kind] = {}
    Object.defineProperty(cache[kind], 'toArray', {
      value: function () {
        return Object.keys(this).map(k => this[k])
      }
    })
  })
  try {
    const devices = await WebRTC.enumerateDevices()
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
  } catch (error) {
    logger.error('enumerateDevices Error', error)
  }
  return cache
}

const resolutionList = [[320, 240], [640, 360], [640, 480], [1280, 720], [1920, 1080]]
const scanResolutions = async (deviceId: string) => {
  const storageKey = `${deviceId}-resolutions`
  const supported = (await localStorage.getItem(storageKey)) || []
  if (supported && supported.length) {
    return supported
  }
  const stream = await getUserMedia({ video: { deviceId: { exact: deviceId } } })
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
  stopStream(stream)

  localStorage.setItem(storageKey, supported)

  return supported
}

const getMediaConstraints = (options: CallOptions): MediaStreamConstraints => {
  let { audio = true } = options
  if (options.micId) {
    if (typeof audio === 'boolean') {
      audio = {}
    }
    audio.deviceId = { exact: options.micId }
  }

  let { video = false } = options
  if (options.camId) {
    if (typeof video === 'boolean') {
      video = {}
    }
    video.deviceId = { exact: options.camId }
  }

  return { audio, video }
}

const assureDeviceId = async (id: string, label: string, kind: MediaDeviceInfo['kind']): Promise<string> => {
  const devices = await WebRTC.enumerateDevices().catch(error => [])
  const empty = devices.length && devices.every((d: MediaDeviceInfo) => d.deviceId === '' && d.label === '')
  if (empty) {
    const stream = await WebRTC.getUserMedia({ audio: true, video: true }).catch(error => null)
    if (stream) {
      WebRTC.stopStream(stream)
      return assureDeviceId(id, label, kind)
    } else {
      return null
    }
  }
  for (let i = 0; i < devices.length; i++) {
    const { deviceId, label: deviceLabel, kind: deviceKind } = devices[i]
    if (kind === deviceKind && (id === deviceId || label === deviceLabel)) {
      return deviceId
    }
  }

  return null
}

const removeUnsupportedConstraints = (constraints: MediaTrackConstraints): void => {
  const supported = WebRTC.getSupportedConstraints()
  Object.keys(constraints).map(key => {
    if (!supported.hasOwnProperty(key)) {
      delete constraints[key]
    }
  })
}

const checkDeviceIdConstraints = async (id: string, label: string, kind: MediaDeviceInfo['kind'], constraints: MediaTrackConstraints) => {
  const { deviceId } = constraints
  if (!isDefined(deviceId) && (id || label)) {
    const deviceId = await assureDeviceId(id, label, kind)
    if (deviceId) {
      constraints.deviceId = { exact: deviceId }
    }
  }
  return constraints
}

/**
 * Add stereo support hacking the SDP
 * @return the SDP modified
 */
const sdpStereoHack = (sdp: string) => {
  const endOfLine = '\r\n'
  const sdpLines = sdp.split(endOfLine)

  const opusIndex = sdpLines.findIndex(s => /^a=rtpmap/.test(s) && /opus\/48000/.test(s))
  if (!opusIndex) {
    return sdp
  }

  const getCodecPayloadType = (line: string) => {
    const pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+')
    const result = line.match(pattern)
    return result && result.length == 2 ? result[1] : null
  }
  const opusPayload = getCodecPayloadType(sdpLines[opusIndex])

  const pattern = new RegExp(`a=fmtp:${opusPayload}`)
  const fmtpLineIndex = sdpLines.findIndex(s => pattern.test(s))

  if (fmtpLineIndex >= 0) {
    if (!/stereo=1;/.test(sdpLines[fmtpLineIndex])) { // Append stereo=1 to fmtp line if not already present
      sdpLines[fmtpLineIndex] += '; stereo=1; sprop-stereo=1'
    }
  } else { // create an fmtp line
    sdpLines[opusIndex] += `${endOfLine}a=fmtp:${opusPayload} stereo=1; sprop-stereo=1`
  }

  return sdpLines.join(endOfLine)
}

const _isAudioLine = (line: string) => /^m=audio/.test(line)
const _isVideoLine = (line: string) => /^m=video/.test(line)

const sdpMediaOrderHack = (answer: string, localOffer: string): string => {
  const endOfLine = '\r\n'
  const offerLines = localOffer.split(endOfLine)
  const offerAudioIndex = offerLines.findIndex(_isAudioLine)
  const offerVideoIndex = offerLines.findIndex(_isVideoLine)
  if (offerAudioIndex < offerVideoIndex) {
    return answer
  }

  const answerLines = answer.split(endOfLine)
  const answerAudioIndex = answerLines.findIndex(_isAudioLine)
  const answerVideoIndex = answerLines.findIndex(_isVideoLine)
  const audioLines = answerLines.slice(answerAudioIndex, answerVideoIndex)
  const videoLines = answerLines.slice(answerVideoIndex, (answerLines.length - 1))
  const beginLines = answerLines.slice(0, answerAudioIndex)
  return [...beginLines, ...videoLines, ...audioLines, ''].join(endOfLine)
}

const checkSubscribeResponse = (response: any, channel: string): boolean => {
  if (!response) {
    return false
  }
  const { subscribed, alreadySubscribed } = destructSubscribeResponse(response)
  return subscribed.includes(channel) || alreadySubscribed.includes(channel)
}

type DestructuredResult = { subscribed: string[], alreadySubscribed: string[], unauthorized: string[], unsubscribed: string[], notSubscribed: string[] }

const destructSubscribeResponse = (response: any): DestructuredResult => {
  const tmp = {
    subscribed: [],
    alreadySubscribed: [],
    unauthorized: [],
    unsubscribed: [],
    notSubscribed: []
  }
  Object.keys(tmp).forEach(k => { tmp[k] = response[`${k}Channels`] || [] })
  return tmp
}

const enableAudioTracks = (stream: MediaStream) => {
  _updateMediaStreamTracks(stream, 'audio', true)
}

const disableAudioTracks = (stream: MediaStream) => {
  _updateMediaStreamTracks(stream, 'audio', false)
}

const toggleAudioTracks = (stream: MediaStream) => {
  _updateMediaStreamTracks(stream, 'audio', null)
}

const enableVideoTracks = (stream: MediaStream) => {
  _updateMediaStreamTracks(stream, 'video', true)
}

const disableVideoTracks = (stream: MediaStream) => {
  _updateMediaStreamTracks(stream, 'video', false)
}

const toggleVideoTracks = (stream: MediaStream) => {
  _updateMediaStreamTracks(stream, 'video', null)
}

const _updateMediaStreamTracks = (stream: MediaStream, kind: string = null, enabled: boolean | string = null) => {
  if (!WebRTC.streamIsValid(stream)) {
    return null
  }
  let tracks: MediaStreamTrack[] = []
  switch (kind) {
    case 'audio':
      tracks = stream.getAudioTracks()
      break
    case 'video':
      tracks = stream.getVideoTracks()
      break
    default:
      tracks = stream.getTracks()
      break
  }
  tracks.forEach((track: MediaStreamTrack) => {
    switch (enabled) {
      case 'on':
      case true:
        track.enabled = true
        break
      case 'off':
      case false:
        track.enabled = false
        break
      default:
        track.enabled = !track.enabled
        break
    }
  })
}

export {
  getUserMedia,
  getDevices,
  scanResolutions,
  getMediaConstraints,
  assureDeviceId,
  removeUnsupportedConstraints,
  checkDeviceIdConstraints,
  sdpStereoHack,
  sdpMediaOrderHack,
  checkSubscribeResponse,
  destructSubscribeResponse,
  enableAudioTracks,
  disableAudioTracks,
  toggleAudioTracks,
  enableVideoTracks,
  disableVideoTracks,
  toggleVideoTracks,
}
