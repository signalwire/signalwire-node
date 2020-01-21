import { CallOptions } from './interfaces'

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

export const DEFAULT_CALL_OPTIONS: CallOptions = {
  destinationNumber: '',
  remoteCallerName: 'Outbound Call',
  remoteCallerNumber: '',
  callerName: '',
  callerNumber: '',
  audio: true,
  video: false,
  useStereo: false,
  attach: false,
  screenShare: false,
  userVariables: {},
  googleMaxBitrate: 2048,
  googleMinBitrate: 0,
  googleStartBitrate: 1024,
}

export enum State {
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

export enum Role {
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
  LayerInfo = 'layerInfo',
  LogoInfo = 'logoInfo',
  LayoutInfo = 'layoutInfo',
  LayoutList = 'layoutList',
  ModCmdResponse = 'modCommandResponse',
}

export enum DeviceType {
  Video = 'videoinput',
  AudioIn = 'audioinput',
  AudioOut = 'audiooutput'
}
