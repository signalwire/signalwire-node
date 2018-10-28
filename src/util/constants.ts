export const NETCAST_SUBCOMMAND: { [k: string]: string } = {
  PROTOCOL_PROVIDER_ADD: 'protocol.provider.add',
  PROTOCOL_PROVIDER_REMOVE: 'protocol.provider.remove'
}

export const BLADE_SUBSCRIBE_COMMAND: { [k: string]: string } = {
  ADD: 'add',
  REMOVE: 'remove'
}

export const EVENTS: { [k: string]: string } = {
  ALL: 'signalwire',
  WS: 'signalwire.socket',
  WS_OPEN: 'signalwire.socket.open',
  WS_CLOSE: 'signalwire.socket.close',
  WS_ERROR: 'signalwire.socket.error',
  WS_MESSAGE: 'signalwire.socket.message',

  READY: 'signalwire.ready',

  MESSAGES: 'signalwire.messages',
  CALLS: 'signalwire.calls'
}
