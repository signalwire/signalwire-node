import logger from '../util/logger'
import * as WebRTC from '../util/webrtc'
import { roundToFixed } from '../util/helpers'
import { assureDeviceId } from './deviceHelpers'
import { DeviceType } from './constants'
import { CallOptions, IVertoCanvasInfo, ICanvasInfo, ICanvasLayout } from './interfaces'

export const getUserMedia = async (constraints: MediaStreamConstraints): Promise<MediaStream | null> => {
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

export const removeUnsupportedConstraints = (constraints: MediaTrackConstraints): void => {
  const supported = WebRTC.getSupportedConstraints()
  Object.keys(constraints).map(key => {
    if (!supported.hasOwnProperty(key) || constraints[key] === null || constraints[key] === undefined) {
      delete constraints[key]
    }
  })
}

export const getMediaConstraints = async (options: CallOptions): Promise<MediaStreamConstraints> => {
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

type DestructuredResult = { subscribed: string[], alreadySubscribed: string[], unauthorized: string[], unsubscribed: string[], notSubscribed: string[] }

export const destructSubscribeResponse = (response: any): DestructuredResult => {
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

const _updateMediaStreamTracks = (stream: MediaStream, kind: string = null, enabled: boolean = null) => {
  if (!WebRTC.streamIsValid(stream)) {
    return null
  }
  const _updateTrack = (track: MediaStreamTrack) => {
    switch (enabled) {
      case true:
        track.enabled = true
        break
      case false:
        track.enabled = false
        break
      default:
        track.enabled = !track.enabled
        break
    }
  }
  switch (kind) {
    case 'audio':
      return stream.getAudioTracks().forEach(_updateTrack)
    case 'video':
      return stream.getVideoTracks().forEach(_updateTrack)
    default:
      return stream.getTracks().forEach(_updateTrack)
  }
}

export const enableAudioTracks = (stream: MediaStream) => _updateMediaStreamTracks(stream, 'audio', true)
export const disableAudioTracks = (stream: MediaStream) => _updateMediaStreamTracks(stream, 'audio', false)
export const toggleAudioTracks = (stream: MediaStream) => _updateMediaStreamTracks(stream, 'audio', null)
export const enableVideoTracks = (stream: MediaStream) => _updateMediaStreamTracks(stream, 'video', true)
export const disableVideoTracks = (stream: MediaStream) => _updateMediaStreamTracks(stream, 'video', false)
export const toggleVideoTracks = (stream: MediaStream) => _updateMediaStreamTracks(stream, 'video', null)

export const mutateCanvasInfoData = (canvasInfo: IVertoCanvasInfo): ICanvasInfo => {
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

export const checkIsDirectCall = ({ variables }) => {
  return typeof variables === 'object' && 'verto_svar_direct_call' in variables
}
