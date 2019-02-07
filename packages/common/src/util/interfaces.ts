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

export interface IBladeProtocolProviderAdd extends IMessageBase {
  method: string
  params: {
    protocol: string
    command?: string
    params: IProtocol['params']
  }
}

export interface IBladeProtocolProviderRemove extends IMessageBase {
  method: string
  params: {
    command?: string
    protocol: string
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
}

export interface BroadcastParams {
  channel?: string
  protocol?: string
  data?: object
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

export interface ICallOptions {
  from_number: string
  to_number: string
  timeout?: number
  type?: string
  node_id?: string
  call_id?: string
  call_state?: string
  context?: string
}
