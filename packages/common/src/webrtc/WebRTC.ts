import {adaptToAsyncAPI} from '../util/helpers'
import * as WebRTC from '../util/webrtc'

export interface IWebRTCOverridesManager {
  RTCPeerConnection: (params) => RTCPeerConnection
  getUserMedia: typeof WebRTC.getUserMedia
  getDisplayMedia: typeof WebRTC.getDisplayMedia
  enumerateDevices: typeof WebRTC.enumerateDevices
  getSupportedConstraints: typeof WebRTC.getSupportedConstraints
  attachMediaStream: typeof WebRTC.attachMediaStream
}

export class WebRTCOverridesManager implements IWebRTCOverridesManager {
  private constructor() {}

  private static _instance: WebRTCOverridesManager
  private _RTCPeerConnection: (params) => RTCPeerConnection
  private _getUserMedia: typeof WebRTC.getUserMedia
  private _getDisplayMedia: typeof WebRTC.getDisplayMedia
  private _enumerateDevices: typeof WebRTC.enumerateDevices
  private _getSupportedConstraints: typeof WebRTC.getSupportedConstraints
  private _attachMediaStream: typeof WebRTC.attachMediaStream

  static getInstance() {
    if (!this._instance) {
      this._instance = new WebRTCOverridesManager()
    }
    return this._instance
  }

  get RTCPeerConnection(): (params) => RTCPeerConnection {
    return (params) => {
      const peerConnectionBuilder =
        this._RTCPeerConnection ?? WebRTC.RTCPeerConnection
      const peerConnectionInstance = peerConnectionBuilder(params)

      return adaptToAsyncAPI(peerConnectionInstance, ['addTrack', 'getSender'])
    }
  }

  set RTCPeerConnection(value) {
    this._RTCPeerConnection = value
  }
  get getUserMedia(): typeof WebRTC.getUserMedia {
    return this._getUserMedia ?? WebRTC.getUserMedia
  }
  set getUserMedia(value) {
    this._getUserMedia = value
  }
  get getDisplayMedia() {
    return this._getDisplayMedia ?? WebRTC.getDisplayMedia
  }
  set getDisplayMedia(value) {
    this._getDisplayMedia = value
  }
  get enumerateDevices() {
    return this._enumerateDevices ?? WebRTC.enumerateDevices
  }
  set enumerateDevices(value) {
    this._enumerateDevices = value
  }
  get getSupportedConstraints() {
    return this._getSupportedConstraints ?? WebRTC.getSupportedConstraints
  }
  set getSupportedConstraints(value) {
    this._getSupportedConstraints = value
  }
  get attachMediaStream() {
    return this._attachMediaStream ?? WebRTC.attachMediaStream
  }
}

const RTCPeerConnection = (params) =>
  WebRTCOverridesManager.getInstance().RTCPeerConnection(params)

const getUserMedia = (params) =>
  WebRTCOverridesManager.getInstance().getUserMedia(params)

const getDisplayMedia = (params) =>
  WebRTCOverridesManager.getInstance().getDisplayMedia(params)

const enumerateDevices = () =>
  WebRTCOverridesManager.getInstance().enumerateDevices()

const getSupportedConstraints = () =>
  WebRTCOverridesManager.getInstance().getSupportedConstraints()

const streamIsValid = (stream) => WebRTC.streamIsValid(stream)

const attachMediaStream = (tag: any, stream: MediaStream) =>
  WebRTC.attachMediaStream(tag, stream)

const detachMediaStream = (tag: any) => WebRTC.detachMediaStream(tag)

const muteMediaElement = (tag: any) => WebRTC.muteMediaElement(tag)

const unmuteMediaElement = (tag: any) => WebRTC.unmuteMediaElement(tag)
const toggleMuteMediaElement = (tag: any) => WebRTC.toggleMuteMediaElement(tag)
const setMediaElementSinkId = async (
  tag: any,
  deviceId: string,
): Promise<boolean> => WebRTC.setMediaElementSinkId(tag, deviceId)
const sdpToJsonHack = (sdp) => WebRTC.sdpToJsonHack(sdp)
const stopStream = (stream: MediaStream) => WebRTC.stopStream(stream)

export {
  RTCPeerConnection,
  getUserMedia,
  getDisplayMedia,
  enumerateDevices,
  getSupportedConstraints,
  streamIsValid,
  attachMediaStream,
  detachMediaStream,
  sdpToJsonHack,
  stopStream,
  muteMediaElement,
  unmuteMediaElement,
  toggleMuteMediaElement,
  setMediaElementSinkId,
}
