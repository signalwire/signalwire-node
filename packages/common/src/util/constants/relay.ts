export enum CallState {
  None = 'none',
  Created = 'created',
  Ringing = 'ringing',
  Answered = 'answered',
  Ending = 'ending',
  Ended = 'ended'
}

export const CALL_STATES = Object.values(CallState)

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
  Fax = 'calling.call.fax',
  Detect = 'calling.call.detect',
}

export enum CallPlayState {
  Playing = 'playing',
  Error = 'error',
  Finished = 'finished',
}

export enum CallFaxState {
  Page = 'page',
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

export enum CallDetectState {
  Error = 'error',
  Finished = 'finished',
  // CED = 'CED',
  // CNG = 'CNG',
  // Machine = 'MACHINE',
  Human = 'HUMAN',
  // Unknown = 'UNKNOWN',
  // Ready = 'READY',
  // NotReady = 'NOT_READY',
}

export enum CallDetectType {
  Fax = 'fax',
  Machine = 'machine',
  Digit = 'digit',
}
