interface IMessageBase { jsonrpc: string, id: string }

export interface IChannel { name: string, broadcast_access?: number, subscribe_access?: number }

// export interface INode { nodeid: string }

export interface IMethod { name: string, execute_access: number }

export interface IProtocol {
  provider_nodeid: string
  command?: string
  protocol: string
  params: {
    default_method_execute_access: number
    default_channel_broadcast_access: number
    default_channel_subscribe_access: number
    channels: IChannel[],
    methods: IMethod[],
  }
}

export interface ISubscription { channel: string, protocol: string, subscribers: string[] }

export interface IBladeResultError extends IMessageBase { error: { code: number, message: string } }

export interface IBladeConnectRequest extends IMessageBase {
  method: string
  params: {
    version: {
      major: number
      minor: number
      revision: number
    }
    sessionid?: string
    authentication: object
  }
}

export interface IBladeConnectResult extends IMessageBase {
  sessionid: string
  nodeid: string
  master_nodeid: string
  protocols_uncertified: string[]
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
  host: string,
  project?: string
  token?: string
  domain?: string
  resource?: string
  login?: string
  passwd?: string
  password?: string
  userVariables?: Object
}

export interface DialogOptions {
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
  mutateLocalStream?: Function
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

export interface ICacheResolution extends MediaTrackSettings {
  resolution: string
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
  state: string
  prevState: string
  on: Function
  off: Function
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
