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
