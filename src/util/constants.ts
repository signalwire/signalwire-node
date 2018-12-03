export enum Netcast {
  ProtocolProviderAdd = 'protocol.provider.add',
  ProtocolProviderRemove = 'protocol.provider.remove'
}

export const ADD = 'add'
export const REMOVE = 'remove'

export enum SwEvent {
  // Socket Events
  SocketOpen = 'signalwire.socket.open',
  SocketClose = 'signalwire.socket.close',
  SocketError = 'signalwire.socket.error',
  SocketMessage = 'signalwire.socket.message',

  // Global Events
  Ready = 'signalwire.ready',

  // Blade Events
  Messages = 'signalwire.messages',
  Calls = 'signalwire.calls',

  // Verto Events
  VertoDialogChange = 'signalwire.verto.dialogChange',
  VertoDisplay = 'signalwire.verto.display',
  VertoInfo = 'signalwire.verto.info',
  VertoEvent = 'signalwire.verto.event',
  VertoPvtEvent = 'signalwire.verto.pvtEvent',
  VertoClientReady = 'signalwire.verto.clientReady',

  // RTC Events
  Sdp = 'signalwire.rtc.sdp',
  Ice = 'signalwire.rtc.candidate',
  IceSdp = 'signalwire.rtc.icesdp',
  Track = 'signalwire.rtc.ontrack',
  // LocalStream = 'signalwire.rtc.localStream',
  // RemoteStream = 'signalwire.rtc.remoteStream',
  MediaError = 'signalwire.rtc.mediaError',
}

export enum DialogState {
  New,
  Requesting,
  Trying,
  Recovering,
  Ringing,
  Answering,
  Early,
  Active,
  Held,
  Hangup,
  Destroy,
  Purge
}

export enum DialogDirection {
  Inbound = 'inbound',
  Outbound = 'outbound'
}

export enum PeerType {
  Offer = 'offer',
  Answer = 'answer'
}

export enum VertoMethod {
  Invite = 'verto.invite',
  Attach = 'verto.attach',
  Answer = 'verto.answer',
  Info = 'verto.info',
  Display = 'verto.display',
  Media = 'verto.media',
  Event = 'verto.event',
  Bye = 'verto.bye',
  Punt = 'verto.punt',
  Broadcast = 'verto.broadcast',
  Subscribe = 'verto.subscribe',
  Unsubscribe = 'verto.unsubscribe',
  ClientReady = 'verto.clientReady',
}
