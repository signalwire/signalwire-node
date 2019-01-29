export enum CallState {
  None,
  Created,
  Ringing,
  Answered,
  Ending,
  Ended
}

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
