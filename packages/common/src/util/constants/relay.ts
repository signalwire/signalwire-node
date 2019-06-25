export enum CallState {
  none,
  created,
  ringing,
  answered,
  ending,
  ended
}

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
  Disconnected = 'disconnected',
  Connecting = 'connecting',
  Connected = 'connected',
  Failed = 'failed',
}

export enum CallNotification {
  State = 'calling.call.state',
  Receive = 'calling.call.receive',
  Connect = 'calling.call.connect',
  Record = 'calling.call.record',
  Play = 'calling.call.play',
  Collect = 'calling.call.collect',
}

export enum CallPlayState {
  Playing = 'playing',
  Error = 'error',
  Finished = 'finished',
}

export enum CallPromptState {
  Error = 'error',
  NoInput = 'no_input',
  NoMatch = 'no_match',
  Digit = 'digit',
  Speech = 'speech',
}

export enum CallRecordState {
  Recording = 'recording',
  NoInput = 'no_input',
  Finished = 'finished',
}
