interface IMessageBase { jsonrpc: string, id: string }

export interface IBladeConnectRequest extends IMessageBase {
  method: string
  params: {
    version: { major: number, minor: number, revision: number }
    authentication: { project: string, token?: string, jwt_token?: string }
    sessionid?: string
    agent?: string
  }
}

export interface IBladeConnectResult extends IMessageBase {
  sessionid: string
  nodeid: string
  master_nodeid: string
  protocols_uncertified: string[]
  authorization: {
    expires_at: number
    signature: string
  }
}

export interface IBladeExecuteRequest extends IMessageBase {
  method: string
  params: {
    protocol: string
    method: string
    params: any
  }
}

export interface IBladeExecuteResult extends IMessageBase {
  result: {
    requester_nodeid: string
    responder_nodeid: string
    protocol: string
    result: any
  }
}

export interface IBladeSubscriptionRequest extends IMessageBase {
  method: string
  params: {
    command: string
    protocol: string
    channels: string[]
    auto_create?: boolean
    downstream?: boolean
  }
}

export interface ISignalWireOptions {
  host?: string,
  project?: string
  token?: string
  login?: string
  passwd?: string
  password?: string
  userVariables?: Object
}

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

export interface SubscribeParams {
  channels?: string[]
  protocol?: string
  handler?: Function
  nodeId?: string
}

export interface BroadcastParams {
  channel?: string
  protocol?: string
  data?: object
  nodeId?: string
}

export interface ICacheDevices {
  videoinput?: { [deviceId: string]: MediaDeviceInfo }
  audioinput?: { [deviceId: string]: MediaDeviceInfo }
  audiooutput?: { [deviceId: string]: MediaDeviceInfo }
}

export interface IAudioSettings extends MediaTrackConstraints {
  micId?: string
  micLabel?: string
}

export interface IVideoSettings extends MediaTrackConstraints {
  camId?: string
  camLabel?: string
}

export interface IRelayConsumerParams {
  host?: string
  project: string
  token: string
  contexts?: string[]
  onIncomingCall?: Function
  onIncomingMessage?: Function
  onMessageStateChange?: Function
  onTask?: Function
  setup?: Function
  ready?: Function
  teardown?: Function
}

export interface StringTMap<T> { [key: string]: T }
export interface StringStringMap extends StringTMap<string> { }
