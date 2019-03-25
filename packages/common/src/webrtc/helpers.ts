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
  let videoDevices = []
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    videoDevices = devices.filter(d => d.kind === 'videoinput')
  } catch (error) {
    return []
  }
  const supported = []
  if (videoDevices.length) {
    for (let i = 0; i < resolutionList.length; i++) {
      const [width, height] = resolutionList[i]
      const resolution = { resolution: `${width}x${height}`, width, height, devices: [] }
      for (let y = 0; y < videoDevices.length; y++) {
        try {
          const constraints = { video: { width: { exact: width }, height: { exact: height }, deviceId: { exact: videoDevices[y].deviceId } } }
          const stream = await getUserMedia(constraints)
          stream.getVideoTracks().forEach(t => t.stop())
          resolution.devices.push( Object.assign(videoDevices[y]) )
        } catch {}
      }
      if (resolution.devices.length) {
        supported.push(resolution)
      }
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
      // logger.warn(`"${key}" constraint is not supported in this browser!`)
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
  let wrapper = response
  const { result = null } = response
  if (result) {
    wrapper = result.result || {}
  }
  Object.keys(tmp).forEach(k => { tmp[k] = wrapper[`${k}Channels`] || [] })
  return tmp
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
  checkDeviceIdConstraints,
  sdpStereoHack,
  sdpMediaOrderHack,
  checkSubscribeResponse,
  destructSubscribeResponse
}
