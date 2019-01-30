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
  Hangup,
  Cancel,
  Busy,
  NoAnswer,
  Decline,
  Error
}

export enum DisconnectSource {
  None,
  Client,
  Server,
  Endpoint
}
