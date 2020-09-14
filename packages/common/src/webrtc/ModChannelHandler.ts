import logger from '../util/logger'
import { ConferenceAction } from './constants'
import BrowserSession from '../BrowserSession'

// TODO: clear serno
let lastSerno = 0

export default function modChannelHandler(session: BrowserSession, { data, eventChannel, eventSerno = null }: any) {
  if (eventSerno !== null && eventSerno === lastSerno) {
    return logger.debug('Skip Mod event:', eventSerno, 'last was:', lastSerno)
  }
  lastSerno = eventSerno
  const callIds = session.channelToCallIds.get(eventChannel) || []
  let params = null
  switch (data['conf-command']) {
    case 'list-videoLayouts':
      if (data.responseData) {
        const tmp = JSON.stringify(data.responseData).replace(/IDS"/g, 'Ids"')
        params = { action: ConferenceAction.LayoutList, layouts: JSON.parse(tmp) }
      }
      break
    default:
      params = { action: ConferenceAction.ModCmdResponse, command: data['conf-command'], response: data.response }
  }
  if (params) {
    _dispatch(session, params, callIds)
  }
}

const _dispatch = (session: BrowserSession, params: any, callIds: string[]) => {
  if (callIds.length) {
    callIds.forEach(callId => {
      session.calls[callId] && session.calls[callId]._dispatchConferenceUpdate(params)
    })
  } else {
    // console.warn('Dispatch global ConferenceUpdate for', params)
    session.dispatchConferenceUpdate(params)
  }
}

function _modCommand(params: any) {
  const { session, nodeId, channel, ...rest } = this
  if (!channel) {
    return console.warn('Missing modChannel')
  }
  const data = { application: 'conf-control', ...rest, ...params }
  session.vertoBroadcast({ nodeId, channel, data })
}

export const publicModMethods = {

  // NB: "this" refers to a special object to pass channel and params.
  // See WebRTCCall conferenceJoinHandler method
  modCommand: function (command: string, id: string, value: any) {
    return _modCommand.call(this, { command, id, value })
  },

  listVideoLayouts: function () {
    const params = { command: 'list-videoLayouts' }
    return _modCommand.call(this, params)
  },

  playMedia: function(file: string) {
    return _modCommand.call(this, { command: 'play', value: file })
  },

  stopMedia: function() {
    return _modCommand.call(this, { command: 'stop', value: 'all' })
  },

  pauseMedia: function(isAsync: boolean = true) {
    const async = isAsync ? 'async' : ''
    return _modCommand.call(this, { command: 'pause_play', value: [async] })
  },

  fileSeek: function(value: string, isAsync: boolean = true) {
    const async = isAsync ? 'async' : ''
    return _modCommand.call(this, { command: 'file_seek', value: [String(value), async] })
  },

  fileVolume: function(value: string, isAsync: boolean = true) {
    const async = isAsync ? 'async' : ''
    return _modCommand.call(this, { command: 'file-vol', value: [String(value), async] })
  },

  startRecord: function(file: string) {
    return _modCommand.call(this, { command: 'recording', value: ['start', file] })
  },

  stopRecord: function() {
    return _modCommand.call(this, { command: 'recording', value: ['stop', 'all'] })
  },

  snapshot: function(file: string) {
    return _modCommand.call(this, { command: 'vid-write-png', value: file })
  },

  setVideoLayout: function(layout: string, canvasID: number) {
    const value = canvasID ? [layout, canvasID] : layout
    return _modCommand.call(this, { command: 'vid-layout', value })
  },

  kick: function(id: string) {
    return _modCommand.call(this, { command: 'kick', id })
  },

  muteAudioAll: function(flags: string = 'nores:nofloor') {
    return _modCommand.call(this, { command: 'mute', value: ['all', flags] })
  },

  unmuteAudioAll: function() {
    return _modCommand.call(this, { command: 'unmute', value: 'all' })
  },

  muteVideoAll: function() {
    return _modCommand.call(this, { command: 'vmute', value: 'all' })
  },

  unmuteVideoAll: function() {
    return _modCommand.call(this, { command: 'unvmute', value: 'all' })
  },

  muteAudio: function(participantId?: string) {
    return _modCommand.call(this, { command: 'mute', id: participantId || this.participantId })
  },

  unmuteAudio: function(participantId?: string) {
    return _modCommand.call(this, { command: 'unmute', id: participantId || this.participantId })
  },

  toggleAudioMute: function(participantId?: string) {
    return _modCommand.call(this, { command: 'tmute', id: participantId || this.participantId })
  },

  muteVideo: function(participantId?: string) {
    return _modCommand.call(this, { command: 'vmute', id: participantId || this.participantId })
  },

  unmuteVideo: function(participantId?: string) {
    return _modCommand.call(this, { command: 'unvmute', id: participantId || this.participantId })
  },

  toggleVideoMute: function(participantId?: string) {
    return _modCommand.call(this, { command: 'tvmute', id: participantId || this.participantId })
  },

  deaf: function(participantId?: string) {
    return _modCommand.call(this, { command: 'deaf', id: participantId || this.participantId })
  },

  undeaf: function(participantId?: string) {
    return _modCommand.call(this, { command: 'undeaf', id: participantId || this.participantId })
  },

  // TODO: implement toggleDeaf

  setReservationId: function(participantId?: string, value: string = 'presenter') {
    return _modCommand.call(this, { command: 'vid-res-id', id: participantId || this.participantId, value })
  },

  videoFloor: function(participantId?: string) {
    return _modCommand.call(this, { command: 'vid-floor', id: participantId || this.participantId, value: 'force' })
  },

  banner: function(text: string, participantId?: string) {
    return _modCommand.call(this, { command: 'vid-banner', id: participantId || this.participantId, value: encodeURI(text) })
  },

  volumeDown: function(participantId?: string) {
    return _modCommand.call(this, { command: 'volume_out', id: participantId || this.participantId, value: 'down' })
  },

  volumeUp: function(participantId?: string) {
    return _modCommand.call(this, { command: 'volume_out', id: participantId || this.participantId, value: 'up' })
  },

  gainDown: function(participantId?: string) {
    return _modCommand.call(this, { command: 'volume_in', id: participantId || this.participantId, value: 'down' })
  },

  gainUp: function(participantId?: string) {
    return _modCommand.call(this, { command: 'volume_in', id: participantId || this.participantId, value: 'up' })
  },

  setEnergy: function(participantId: string, value: string) {
    // TODO: check value ('energy', memberId, String(value * 100));
    return _modCommand.call(this, { command: 'energy', id: participantId, value })
  },

  transfer: function(destination: string, participantId?: string) {
    return _modCommand.call(this, { command: 'transfer', id: participantId || this.participantId, value: destination })
  },

  toggleNoiseBlocker: function(participantId: string) {
    return _modCommand.call(this, { command: 'denoise', id: participantId })
  },

  toggleLowBitrateMode: function(participantId: string) {
    return _modCommand.call(this, { command: 'lowbr', id: participantId })
  },

  addToCall: function(extension: string, email: string = '', name: string = '') {
    return _modCommand.call(this, { command: 'xdial', value: [extension, email, name] })
  },

  toggleHandRaised: function(participantId: string) {
    return _modCommand.call(this, { command: 'handraise', id: participantId })
  },

  confQuality: function(value: string) {
    return _modCommand.call(this, { command: 'quality.lua', value })
  },

  confFullscreen: function(participantId: string, value: string) {
    // remove user/all banners
    return _modCommand.call(this, { command: 'full-screen', id: participantId, value })
  },

  sayAll: function(value: string) {
    return _modCommand.call(this, { command: 'say', value })
  },

  sayMember: function(participantId: string, value: string) {
    return _modCommand.call(this, { command: 'saymember', id: participantId, value })
  },

  setBanner: function(participantId: string, value: string) {
    // TODO: check base64 ('banner.lua', memberId, Base64.encode(value));
    return _modCommand.call(this, { command: 'banner.lua', id: participantId, value })
  },

  setPerformerDelay: function(value: string) {
    return _modCommand.call(this, { command: 'performer-delay', value })
  },

  setVolumeAudience: function(value: string) {
    return _modCommand.call(this, { command: 'vol-audience', value })
  },

  toggleVidMuteHide: function(value: string = 'toggle') {
    return _modCommand.call(this, { command: 'vid-mute-hide', value })
  },

  setMeetingMode: function(value: string = 'toggle') {
    return _modCommand.call(this, { command: 'meeting-mode', value })
  },

  setSilentMode: function(value: string = 'toggle') {
    return _modCommand.call(this, { command: 'silent-mode', value })
  },

  setConfVariable: function(variable: string, value: string) {
    return _modCommand.call(this, { command: 'setvar', value: [variable, String(value)] })
  },

  grantModerator: function(participantId: string, value: string) {
    return _modCommand.call(this, { command: 'grant-moderator', id: participantId, value })
  },

  grantScreenShare: function(participantId: string, value: string) {
    return _modCommand.call(this, { command: 'grant-share', id: participantId, value })
  },

  setPin: function(pin: string) {
    return _modCommand.call(this, { command: 'pin', value: pin })
  },

  removePin: function() {
    return _modCommand.call(this, { command: 'nopin' })
  },

  setModeratorPin: function(pin: string) {
    return _modCommand.call(this, { command: 'pin', value: `mod ${pin}` })
  },

  removeModeratorPin: function() {
    return _modCommand.call(this, { command: 'pin', value: 'nomod' })
  },

  setConfLayoutMode: function(value: string) {
    return _modCommand.call(this, { command: 'vid-personal', value })
  },

}
