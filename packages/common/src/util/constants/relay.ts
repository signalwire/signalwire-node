export enum CallState {
  none,
  created,
  ringing,
  answered,
  ending,
  ended
}

export const CALL_STATES = Object.keys(CallState).filter(k => isNaN(Number(k)))

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

export const CALL_CONNECT_STATES = Object.keys(CallConnectState).filter(k => isNaN(Number(k)))
