import logger from '../util/logger'
import { mutateLiveArrayData } from '../util/helpers'
import { ConferenceAction } from './constants'
import BrowserSession from '../BrowserSession'

// TODO: clear serno
let lastSerno = 0

export default function (session: BrowserSession, { eventChannel, eventSerno, data: packet }: any) {
  if (!_checkSerno(eventSerno)) {
    if (eventSerno === lastSerno) {
      return logger.info('Skip liveArray event:', eventSerno, 'last was:', lastSerno)
    }
    return logger.error('Invalid conference wireSerno:', packet)
  }
  const callIds = session.channelToCallIds.get(eventChannel) || []
  const { action, data, hashKey: callId } = packet
  switch (action) {
    case 'bootObj': {
      // lastSerno = 0
      const participants = []
      for (const i in data) {
        const participant = { callId: data[i][0], ...mutateLiveArrayData(data[i][1]) }
        const { callId, audio, video } = participant
        const isMyCall = callIds.includes(callId)
        if (isMyCall && audio && video) {
          // TODO: use this method instead
          // session.calls[callId].setValueFromLiveArray(audio, video)
          //   this._isMuted = audio.muted
          //   this._isVmuted = video.muted
          //   if (call) {
          //     this._isVmuted ? call.stopOutboundVideo() : call.restoreOutboundVideo()
          //   }
        }
        participants.push(participant)
      }
      return _dispatch(session, { action: ConferenceAction.Bootstrap, participants }, callIds)
    }
    case 'add':
      return _dispatch(session, { action: ConferenceAction.Add, callId, ...mutateLiveArrayData(data) }, callIds)
    case 'modify': {
      const notification = { action: ConferenceAction.Modify, callId, ...mutateLiveArrayData(data) }
      const isMyCall = callIds.includes(callId)
      if (isMyCall) {
        const { audio, video } = notification
        const call = session.calls[callId]
        // TODO: use this method instead
        // session.calls[callId].setValueFromLiveArray(audio, video)
        if (audio) {
          console.debug('My Audio Changed', call.id, audio.muted)
          // this._isMuted = audio.muted
        }
        if (video) {
          console.debug('My Video Changed', call.id, video.muted)
          // if (this._isVmuted !== video.muted) {
          //   video.muted ? call.stopOutboundVideo() : call.restoreOutboundVideo()
          // }
          // this._isVmuted = video.muted
        }
      }
      return _dispatch(session, notification, callIds)
    }
    case 'del':
      return _dispatch(session, { action: ConferenceAction.Delete, callId, ...mutateLiveArrayData(data) }, callIds)
    case 'clear':
      return _dispatch(session, { action: ConferenceAction.Clear }, callIds)
    default:
      return _dispatch(session, { action, data, callId }, callIds)
  }
}

export const publicLiveArrayMethods = {
  // NB: "this" refers to a special object to pass channel and params.
  // See WebRTCCall conferenceJoinHandler method
  liveArrayBootstrap: function() {
    const { session, nodeId, channel, laName } = this
    const data = { liveArray: { command: 'bootstrap', context: channel, name: laName } }
    session.vertoBroadcast({ nodeId, channel, data })
  }
}

const _checkSerno = (serno: number) => {
  const check = (serno < 0) || (!lastSerno || (lastSerno && serno === (lastSerno + 1)))
  if (check && serno >= 0) {
    lastSerno = serno
  }
  return check
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
