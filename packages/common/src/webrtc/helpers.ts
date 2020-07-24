import logger from '../util/logger'
import * as WebRTC from '../util/webrtc'
import { isDefined, roundToFixed } from '../util/helpers'
import { DeviceType } from './constants'
import { CallOptions, IVertoCanvasInfo, ICanvasInfo, ICanvasLayout } from './interfaces'

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

const _constraintsByKind = (kind: string = null): { audio: boolean, video: boolean } => {
  return {
    audio: !kind || kind === DeviceType.AudioIn,
    video: !kind || kind === DeviceType.Video
  }
}

/**
 * Retrieve device list using the browser APIs
 * If 'deviceId' or 'label' are missing it means we are on Safari (macOS or iOS)
 * so we must request permissions to the user and then refresh the device list.
 */
const getDevices = async (kind: string = null, fullList: boolean = false): Promise<MediaDeviceInfo[]> => {
  let devices = await WebRTC.enumerateDevices().catch(error => [])
  if (kind) {
    devices = devices.filter((d: MediaDeviceInfo) => d.kind === kind)
  }
  const valid: boolean = devices.length && devices.every((d: MediaDeviceInfo) => (d.deviceId && d.label))
  if (!valid) {
    const stream = await WebRTC.getUserMedia(_constraintsByKind(kind))
    WebRTC.stopStream(stream)
    return getDevices(kind)
  }
  if (fullList === true) {
    return devices
  }
  const found = []
  devices = devices.filter(({ kind, groupId }: MediaDeviceInfo) => {
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

const resolutionList = [[320, 240], [640, 360], [640, 480], [1280, 720], [1920, 1080]]
const scanResolutions = async (deviceId: string) => {
  const supported = []
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
  WebRTC.stopStream(stream)

  return supported
}

const getMediaConstraints = async (options: CallOptions): Promise<MediaStreamConstraints> => {
  let { audio = true, micId } = options
  const { micLabel = '' } = options
  if (micId) {
    micId = await assureDeviceId(micId, micLabel, DeviceType.AudioIn).catch(error => null)
    if (micId) {
      if (typeof audio === 'boolean') {
        audio = {}
      }
      audio.deviceId = { exact: micId }
    }
  }

  let { video = false, camId } = options
  const { camLabel = '' } = options
  if (camId) {
    camId = await assureDeviceId(camId, camLabel, DeviceType.Video).catch(error => null)
    if (camId) {
      if (typeof video === 'boolean') {
        video = {}
      }
      video.deviceId = { exact: camId }
    }
  }

  return { audio, video }
}

const assureDeviceId = async (id: string, label: string, kind: MediaDeviceInfo['kind']): Promise<string> => {
  const devices = await getDevices(kind, true)
  for (let i = 0; i < devices.length; i++) {
    const { deviceId, label: deviceLabel } = devices[i]
    if (id === deviceId || label === deviceLabel) {
      return deviceId
    }
  }

  return null
}

const removeUnsupportedConstraints = (constraints: MediaTrackConstraints): void => {
  const supported = WebRTC.getSupportedConstraints()
  Object.keys(constraints).map(key => {
    if (!supported.hasOwnProperty(key) || constraints[key] === null || constraints[key] === undefined) {
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
  if (opusIndex < 0) {
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

const sdpAudioVideoOrderHack = (offerLines: string): string => {
  const endOfLine = '\r\n'
  const sdp = offerLines.split(endOfLine)
  const offerAudioIndex = sdp.findIndex(_isAudioLine)
  const offerVideoIndex = sdp.findIndex(_isVideoLine)
  if (offerAudioIndex < offerVideoIndex) {
    return offerLines
  }

  const newLines = offerLines.split(endOfLine)
  const beginLines = newLines.slice(0, offerVideoIndex)
  const videoLines = newLines.slice(offerVideoIndex, offerAudioIndex)
  const audioLines = newLines.slice(offerAudioIndex, (newLines.length - 1))
  return [...beginLines, ...audioLines, ...videoLines, ''].join(endOfLine)
}

const sdpAudioRemoveRTPExtensions = (sdp: string, extensionsToFilter: string[]): string => {
  const endOfLine = '\r\n'

  let beginLines: string[] = []
  let audioLines: string[] = []
  let videoLines: string[] = []
  const newLines = sdp.split(endOfLine)

  const offerAudioIndex = newLines.findIndex(_isAudioLine)
  const offerVideoIndex = newLines.findIndex(_isVideoLine)

  if (offerAudioIndex < offerVideoIndex) {
    beginLines = newLines.slice(0, offerAudioIndex)
    audioLines = newLines.slice(offerAudioIndex, offerVideoIndex)
    videoLines = newLines.slice(offerVideoIndex, (newLines.length - 1))
  } else {
    beginLines = newLines.slice(0, offerVideoIndex)
    audioLines = newLines.slice(offerAudioIndex, (newLines.length - 1))
    videoLines = newLines.slice(offerVideoIndex, offerAudioIndex)
  }

  const newAudioLines = audioLines.filter((line: string) => {
    return !(line.includes(extensionsToFilter[0]) || line.includes(extensionsToFilter[1]) || line.includes(extensionsToFilter[2]))
  })

  return [...beginLines, ...newAudioLines, ...videoLines, ''].join(endOfLine)
}

const sdpAudioRemoveRidMidExtHack = (sdp: string): string => {
  const extensionsToFilter = [
    'urn:ietf:params:rtp-hdrext:sdes:mid',
    'urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id',
    'urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id',
  ]
  return sdpAudioRemoveRTPExtensions(sdp, extensionsToFilter)
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

/**
 * Modify the SDP to increase video bitrate
 * @return the SDP modified
 */
const sdpBitrateHack = (sdp: string, max: number, min: number, start: number) => {
  const endOfLine = '\r\n'
  const lines = sdp.split(endOfLine)
  lines.forEach((line, i) => {
    if (/^a=fmtp:\d*/.test(line)) {
      lines[i] += `;x-google-max-bitrate=${max};x-google-min-bitrate=${min};x-google-start-bitrate=${start}`
    } else if (/^a=mid:(1|video)/.test(line)) {
      lines[i] += `\r\nb=AS:${max}`
    }
  })
  return lines.join(endOfLine)
}

const mutateCanvasInfoData = (canvasInfo: IVertoCanvasInfo): ICanvasInfo => {
  const { canvasID, layoutFloorID, scale, canvasLayouts, ...rest } = canvasInfo
  const layouts: ICanvasLayout[] = []
  let layoutOverlap = false
  for (let i = 0; i < canvasLayouts.length; i++) {
    const layout = canvasLayouts[i]
    const { memberID, audioPOS, xPOS, yPOS, ...rest } = layout
    layoutOverlap = layoutOverlap || layout.overlap === 1
    layouts.push({
      startX: `${roundToFixed((layout.x / scale) * 100)}%`,
      startY: `${roundToFixed((layout.y / scale) * 100)}%`,
      percentageWidth: `${roundToFixed((layout.scale / scale) * 100)}%`,
      percentageHeight: `${roundToFixed((layout.hscale / scale) * 100)}%`,
      participantId: String(memberID),
      audioPos: audioPOS,
      xPos: xPOS,
      yPos: yPOS,
      ...rest
    })
  }
  return {
    ...rest,
    canvasId: canvasID,
    layoutFloorId: layoutFloorID,
    scale,
    canvasLayouts: layouts,
    layoutOverlap,
  }
}

const checkIsDirectCall = ({ variables }) => {
  return typeof variables === 'object' && 'verto_svar_direct_call' in variables
}

let transformStart = 0

const senderTransform = new TransformStream({

		start() {
            // Called on startup.
            transformStart = 0
            //setTimeout(function(){ alert("e2ee: timeout"); transformStart = 1 }, 30000);
		},

		async transform(encodedFrame, controller) {

            //logger.info('e2ee: transforming frame:', encodedFrame);

            let view = new DataView(encodedFrame.data);
            //logger.info('e2ee: frame data view is:', view);
		
			// Create a new buffer of same length
			let newData = new ArrayBuffer(encodedFrame.data.byteLength);
			let newView = new DataView(newData);

			// Fill the new buffer with a negated version of all
            // the bits in the original frame.
            //if (transformStart) {
            //    for (let i = 0; i < encodedFrame.data.byteLength; ++i)
            //        newView.setInt8(i, ~view.getInt8(i));
            //}

			// Replace the frame's data with the new buffer.
			encodedFrame.data = newData;

			// Send it to the output stream.
			controller.enqueue(encodedFrame);
		},

		flush() {
			// Called when the stream is about to be closed.
            transformStart = 0
		}
});

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
  sdpBitrateHack,
  destructSubscribeResponse,
  enableAudioTracks,
  disableAudioTracks,
  toggleAudioTracks,
  enableVideoTracks,
  disableVideoTracks,
  toggleVideoTracks,
  mutateCanvasInfoData,
  checkIsDirectCall,
  sdpAudioVideoOrderHack,
  sdpAudioRemoveRTPExtensions,
  sdpAudioRemoveRidMidExtHack,
  senderTransform,
}
