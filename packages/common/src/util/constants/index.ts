export enum Netcast {
  ProtocolProviderAdd = 'protocol.provider.add',
  ProtocolProviderRemove = 'protocol.provider.remove'
}

export const STORAGE_PREFIX = '@signalwire:'
export const ADD = 'add'
export const REMOVE = 'remove'
export const SESSION_ID = 'sessId'

export enum SwEvent {
  // Socket Events
  SocketOpen = 'signalwire.socket.open',
  SocketClose = 'signalwire.socket.close',
  SocketError = 'signalwire.socket.error',
  SocketMessage = 'signalwire.socket.message',

  // Internal events
  SpeedTest = 'signalwire.internal.speedtest',

  // Global Events
  Ready = 'signalwire.ready',
  Error = 'signalwire.error',
  Notification = 'signalwire.notification',

  // Blade Events
  Messages = 'signalwire.messages',
  Calls = 'signalwire.calls',

  // RTC Events
  MediaError = 'signalwire.rtc.mediaError',
}

export enum PeerType {
  Offer = 'offer',
  Answer = 'answer'
}

export enum Direction {
  Inbound = 'inbound',
  Outbound = 'outbound'
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
  Modify = 'verto.modify',
}

export const NOTIFICATION_TYPE = {
  generic: 'event',
  [VertoMethod.Display]: 'participantData',
  [VertoMethod.Attach]: 'participantData',
  conferenceUpdate: 'conferenceUpdate',
  callUpdate: 'callUpdate',
  vertoClientReady: 'vertoClientReady',
  userMediaError: 'userMediaError',
  refreshToken: 'refreshToken',
}

export enum BladeMethod {
  Netcast = 'blade.netcast',
  Broadcast = 'blade.broadcast',
  Disconnect = 'blade.disconnect'
}

export enum DeviceType {
  Video = 'videoinput',
  AudioIn = 'audioinput',
  AudioOut = 'audiooutput'
}
