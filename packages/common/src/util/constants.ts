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

  // RTC Events
  MediaError = 'signalwire.rtc.mediaError',
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
