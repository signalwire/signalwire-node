import Call from '../relay/calling/Call'

interface IMessageBase { jsonrpc: string, id: string }

type TBladeVersion = { major: number, minor: number, revision: number }

export interface ISubscription { channel: string, protocol: string, subscribers: string[] }

export interface IBladeResultError extends IMessageBase { error: { code: number, message: string } }

export interface IBladeConnectRequest extends IMessageBase {
  method: string
  params: {
    version: TBladeVersion
    authentication: { project: string, token?: string, jwt_token?: string }
    sessionid?: string
  }
}

export interface IBladeConnectResult extends IMessageBase {
  sessionid: string
  nodeid: string
  master_nodeid: string
  protocols_uncertified: string[]
  authorization: {
    expires_at: number
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
  camId?: string
  speakerId?: string
  userVariables?: Object
  screenShare?: boolean
  onNotification?: Function
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
  micId: string
  micLabel: string
}

export interface IVideoSettings extends MediaTrackConstraints {
  camId: string
  camLabel: string
}

export interface ICall {
  id: string
  tag?: string
  nodeId: string
  state: string
  prevState: string
  context: string
  peer: Call
  type: string
  to: string
  from: string
  timeout: number
  active: boolean
  failed: boolean
  answered: boolean
  ended: boolean
  busy: boolean
  // on: Function
  // off: Function
  dial: Function
  hangup: Function
  record: Function
  recordAsync: Function
  answer: Function
  connect: Function
  connectAsync: Function
  play: Function
  playAsync: Function
  playAudio: Function
  playAudioAsync: Function
  playSilence: Function
  playSilenceAsync: Function
  playTTS: Function
  playTTSAsync: Function
  prompt: Function
  promptAsync: Function
  promptAudio: Function
  promptAudioAsync: Function
  promptTTS: Function
  promptTTSAsync: Function
  // WaitFor: Function
}

export interface ICallDevice {
  type: string
  params: {
    from_number: string
    to_number: string
    timeout: number
  }
}

export interface ICallPeer {
  call_id: string
  node_id: string
  device?: ICallDevice
}

export interface ICallOptions {
  device?: ICallDevice
  peer?: ICallPeer
  node_id?: string
  call_id?: string
  call_state?: string
  context?: string
}

export interface IMakeCallParams {
  type: string
  from?: string
  to: string
  timeout?: number
}

export interface Constructable<T> {
  new(any: any): T
}

export interface StringTMap<T> { [key: string]: T }
export interface StringStringMap extends StringTMap<string> { }

export interface ICallingPlay {
  type: string
  params: {
    url?: string
    text?: string
    language?: string
    gender?: 'male' | 'female'
    duration?: number
  }
}

export interface ICallingCollect {
  initial_timeout: number
  digits?: {
    max: number
    terminators?: string
    digit_timeout: number
  },
  speech?: {
    end_silence_timeout?: number,
    language?: string
    hints?: string[]
  }
}

export interface DeepArray<T> extends Array<T | DeepArray<T>> { }

export interface IRelayConsumerParams {
  host?: string
  project: string
  token: string
  contexts?: string[]
  onIncomingCall?: Function
  onTask?: Function
  setup?: Function
}
