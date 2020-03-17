import WebRTCCall from './WebRTCCall'

export interface CallOptions {
  // Required
  destinationNumber: string
  remoteCallerName: string
  remoteCallerNumber: string
  callerName: string
  callerNumber: string
  // Optional
  id?: string
  remoteSdp?: string
  localStream?: MediaStream
  remoteStream?: MediaStream
  localElement?: HTMLMediaElement | string | Function
  remoteElement?: HTMLMediaElement | string | Function
  iceServers?: RTCIceServer[]
  audio?: boolean | MediaTrackConstraints
  video?: boolean | MediaTrackConstraints
  attach?: boolean
  useStereo?: boolean
  micId?: string
  micLabel?: string
  camId?: string
  camLabel?: string
  speakerId?: string
  userVariables?: Object
  screenShare?: boolean
  onNotification?: Function
  googleMaxBitrate?: number
  googleMinBitrate?: number
  googleStartBitrate?: number
}

export interface ICantinaAuthParams {
  hostname?: string
}

export interface ICantinaUser {
  first_name: string
  last_name: string
  email: string
  phone: string
  avatar: string
  project: string
  jwt_token: string
  scopes: string[]
  config?: object
}

export interface VertoPvtData {
  callID: string
  nodeId?: string
  action: string
  laChannel: string
  laName: string
  role: string
  chatID: string
  conferenceMemberID: number
  canvasCount: string
  modChannel: string
  chatChannel: string
  infoChannel: string
}

export interface IVertoCanvasInfo {
  canvasID: number
  totalLayers: number
  layersUsed: number
  layoutFloorID: number
  layoutName: string
  canvasLayouts: IVertoCanvasLayout[]
  scale: number
}

export interface IVertoCanvasLayout {
  x: number
  y: number
  scale: number
  hscale: number
  zoom: number
  border: number
  floor: number
  overlap: number
  screenWidth: number
  screenHeight: number
  xPOS: number
  yPOS: number
  audioPOS: string
  memberID: number
}

export interface ICanvasInfo {
  canvasId: number
  totalLayers: number
  layersUsed: number
  layoutFloorId: number
  layoutName: string
  canvasLayouts: ICanvasLayout[]
  scale: number
  layoutOverlap: boolean
}

export interface ICanvasLayout {
  x: number
  y: number
  startX: string
  startY: string
  percentageWidth: string
  percentageHeight: string
  scale: number
  hscale: number
  zoom: number
  border: number
  floor: number
  overlap: number
  screenWidth: number
  screenHeight: number
  xPos: number
  yPos: number
  audioPos: string
  participantId: string
}

export interface IHangupParams {
  code?: string
  cause?: string
}

export interface ICallMethods {
  invite(): void
  answer(): void
  hangup(params?: IHangupParams): Promise<void>

  dtmf(dtmf: string): void
  transfer(destination: string, id?: string): void
  replace(callId: string): void
  hold(): Promise<boolean>
  unhold(): Promise<boolean>
  toggleHold(): Promise<boolean>
  muteAudio(participantId?: string): void
  unmuteAudio(participantId?: string): void
  toggleAudioMute(participantId?: string): void
  muteVideo(participantId?: string): void
  unmuteVideo(participantId?: string): void
  toggleVideoMute(participantId?: string): void
  deaf(participantId?: string): void
  undeaf(participantId?: string): void
  toggleDeaf(participantId?: string): void

  startScreenShare?(opts?: CallOptions): Promise<WebRTCCall>
  stopScreenShare?(): void

  sendChatMessage?(message: string, type: string): void
  listVideoLayouts?(): void
  playMedia?(file: string): void
  stopMedia?(): void
  startRecord?(file: string): void
  stopRecord?(): void
  snapshot?(file: string): void
  setVideoLayout?(layout: string, canvasID: number): void
  presenter?(participantId?: string): void
  videoFloor?(participantId?: string): void
  banner?(text: string, participantId?: string): void
  volumeDown?(participantId?: string): void
  volumeUp?(participantId?: string): void
  gainDown?(participantId?: string): void
  gainUp?(participantId?: string): void
  kick?(participantId?: string): void
}
