import { ConferenceAction } from './constants'
import BrowserSession from '../BrowserSession'
import { mungeLayoutList } from './helpers'

export default function modChannelHandler(session: BrowserSession, { data, eventChannel, eventSerno = null }: any) {
  const callIds = session.channelToCallIds.get(eventChannel) || []
  let params = null
  switch (data['conf-command']) {
    case 'list-videoLayouts':
      if (data.responseData) {
        const normal = data.responseData.filter(({ type }) => type === 'layout')
        const group = data.responseData.filter(({ type }) => type === 'layoutGroup')
        const layouts = mungeLayoutList(normal, group)
        params = { action: ConferenceAction.LayoutList, eventChannel, eventSerno, layouts }
      }
      break
    default:
      params = { action: ConferenceAction.ModCmdResponse, eventChannel, eventSerno, command: data['conf-command'], response: data.response }
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

  fileReservationId: function(value: string, isAsync: boolean = true) {
    const async = isAsync ? 'async' : ''
    return _modCommand.call(this, { command: 'file-res-id', value: [String(value), async] })
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

  lock: function() {
    return _modCommand.call(this, { command: 'lock' })
  },

  unlock: function() {
    return _modCommand.call(this, { command: 'unlock' })
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

  muteAudio: function(participantId: string) {
    return _modCommand.call(this, { command: 'mute', id: participantId })
  },

  unmuteAudio: function(participantId: string) {
    return _modCommand.call(this, { command: 'unmute', id: participantId })
  },

  toggleAudioMute: function(participantId: string) {
    return _modCommand.call(this, { command: 'tmute', id: participantId })
  },

  muteVideo: function(participantId: string) {
    return _modCommand.call(this, { command: 'vmute', id: participantId })
  },

  unmuteVideo: function(participantId: string) {
    return _modCommand.call(this, { command: 'unvmute', id: participantId })
  },

  toggleVideoMute: function(participantId: string) {
    return _modCommand.call(this, { command: 'tvmute', id: participantId })
  },

  deaf: function(participantId: string) {
    return _modCommand.call(this, { command: 'deaf', id: participantId })
  },

  undeaf: function(participantId: string) {
    return _modCommand.call(this, { command: 'undeaf', id: participantId })
  },

  // TODO: implement toggleDeaf

  setReservationId: function(participantId: string, value: string = 'presenter') {
    return _modCommand.call(this, { command: 'vid-res-id', id: participantId, value })
  },

  videoFloor: function(participantId: string) {
    return _modCommand.call(this, { command: 'vid-floor', id: participantId, value: 'force' })
  },

  banner: function(participantId: string, text: string) {
    return _modCommand.call(this, { command: 'vid-banner', id: participantId, value: encodeURI(text) })
  },

  volumeDown: function(participantId: string) {
    return _modCommand.call(this, { command: 'volume_out', id: participantId, value: 'down' })
  },

  volumeUp: function(participantId: string) {
    return _modCommand.call(this, { command: 'volume_out', id: participantId, value: 'up' })
  },

  gainDown: function(participantId: string) {
    return _modCommand.call(this, { command: 'volume_in', id: participantId, value: 'down' })
  },

  gainUp: function(participantId: string) {
    return _modCommand.call(this, { command: 'volume_in', id: participantId, value: 'up' })
  },

  setEnergy: function(participantId: string, value: string) {
    // TODO: check value ('energy', memberId, String(value * 100));
    return _modCommand.call(this, { command: 'energy', id: participantId, value })
  },

  transferMember: function(participantId: string, destination: string) {
    return _modCommand.call(this, { command: 'transfer', id: participantId, value: destination })
  },

  setDenoise: function(participantId: string, value: string = null) {
    return _modCommand.call(this, { command: 'denoise', id: participantId, value })
  },

  setLowBitrate: function(participantId: string, value: string = null) {
    return _modCommand.call(this, { command: 'lowbr', id: participantId, value })
  },

  addToCall: function(extension: string, email: string = '', name: string = '') {
    return _modCommand.call(this, { command: 'xdial', value: [extension, email, name] })
  },

  setHandRaised: function(participantId: string, value: string = null) {
    return _modCommand.call(this, { command: 'handraise', id: participantId, value })
  },

  setVidFloorResId: function(value: string) {
    return _modCommand.call(this, { command: 'vid-floor-res-id', value })
  },

  confQuality: function(value: string) {
    return _modCommand.call(this, { command: 'quality.lua', value })
  },

  confMotionQuality: function(value: string) {
    return _modCommand.call(this, { command: 'motion-quality', value })
  },

  confMotionQualityInbound: function(value: string) {
    return _modCommand.call(this, { command: 'motion-quality-in', value })
  },

  confMotionQualityMember: function(participantId: string, value: string) {
    return _modCommand.call(this, { command: 'motion-quality-member', id: participantId, value })
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
    // const clean = Base64.encode(value)
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

  shuffleVideo: function(value: string) {
    return _modCommand.call(this, { command: 'shuffle', value })
  },

}
