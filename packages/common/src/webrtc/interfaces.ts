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

// export interface IWebRTCCall {
//   id: string
//   state: string
//   prevState: string
//   direction: string
//   options: CallOptions
//   channels: string[]
//   role: string
//   extension: string
//   localStream: MediaStream
//   remoteStream: MediaStream
//   cause?: string
//   causeCode?: number
//   invite: () => void
//   answer: () => void
//   hangup: (params?: any, execute?: boolean) => void
//   transfer: (destination: string) => void
//   replace: (replaceCallID: string) => void
//   dtmf: (dtmf: string) => void
//   message: (to: string, body: string) => void
//   hold: () => void
//   unhold: () => void
//   toggleHold: () => void
//   muteAudio: () => void
//   unmuteAudio: () => void
//   toggleAudioMute: () => void
//   setAudioInDevice: (deviceId: string) => Promise<void>
//   muteVideo: () => void
//   unmuteVideo: () => void
//   toggleVideoMute: () => void
//   setVideoDevice: (deviceId: string) => Promise<void>
//   deaf: () => void
//   undeaf: () => void
//   toggleDeaf: () => void
//   setState: (state: any) => void
//   // WEB
//   startScreenShare?: (opts?: object) => Promise<IWebRTCCall>
//   stopScreenShare?: () => void
//   setAudioOutDevice?: (deviceId: string) => Promise<boolean>
//   // RN
//   switchCamera?: () => void
//   setSpeakerPhone?: (flag: boolean) => void
// }

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
