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
