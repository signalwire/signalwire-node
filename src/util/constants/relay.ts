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
