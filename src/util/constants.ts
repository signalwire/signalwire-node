import { DialogOptions } from '../interfaces/'

export enum Netcast {
  ProtocolProviderAdd = 'protocol.provider.add',
  ProtocolProviderRemove = 'protocol.provider.remove'
}

export const STORAGE_PREFIX = '@signalwire:'
export const ADD = 'add'
export const REMOVE = 'remove'

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

export const NOTIFICATION_TYPE = {
  generic: 'event',
  [VertoMethod.Display]: 'participantData',
  [VertoMethod.Attach]: 'participantData',
  conferenceUpdate: 'conferenceUpdate',
  dialogUpdate: 'dialogUpdate',
  vertoClientReady: 'vertoClientReady',
  userMediaError: 'userMediaError'
}

export const DEFAULT_DIALOG_OPTIONS: DialogOptions = {
  destinationNumber: '',
  remoteCallerName: 'Outbound Call',
  remoteCallerNumber: '',
  callerName: '',
  callerNumber: '',
  audio: true,
  video: false,
  useStereo: true,
  attach: false,
  screenShare: false,
  userVariables: {}
}

export enum DialogRole {
  Participant = 'participant',
  Moderator = 'moderator',
}

export enum ConferenceAction {
  Join = 'join',
  Leave = 'leave',
  Bootstrap = 'bootstrap',
  Add = 'add',
  Modify = 'modify',
  Delete = 'delete',
  Clear = 'clear',
  ChatMessage = 'chatMessage',
  LayoutInfo = 'layoutInfo',
  LayoutList = 'layoutList',
  ModCmdResponse = 'modCommandResponse',
}
