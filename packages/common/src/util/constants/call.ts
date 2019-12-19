import { CallOptions } from '../interfaces'

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
