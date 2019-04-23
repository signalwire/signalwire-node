export enum CallState {
  none,
  created,
  ringing,
  answered,
  ending,
  ended
}

// export const CALL_STATES = Object.keys(CallState).filter(k => isNaN(Number(k)))
export const DEFAULT_CALL_TIMEOUT = 30

export enum DisconnectReason {
  Hangup = 'hangup',
  Cancel = 'cancel',
  Busy = 'busy',
  NoAnswer = 'noAnswer',
  Decline = 'decline',
  Error = 'error'
}

export enum DisconnectSource {
  None = 'none',
  Client = 'client',
  Server = 'server',
  Endpoint = 'endpoint'
}

export enum CallType {
  Phone = 'phone',
  Sip = 'sip',
  WebRTC = 'webrtc'
}

export enum CallConnectState {
  disconnected,
  connecting,
  connected,
  failed
}

export enum CallNotification {
  State = 'calling.call.state',
  Receive = 'calling.call.receive',
  Connect = 'calling.call.connect',
  Record = 'calling.call.record',
  Play = 'calling.call.play',
  Collect = 'calling.call.collect',
}

// export const CALL_CONNECT_STATES = Object.keys(CallConnectState).filter(k => isNaN(Number(k)))
