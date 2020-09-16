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
    logger.warn('liveArray eventSerno mismatch:', lastSerno, eventSerno, packet)
    lastSerno = eventSerno
  }
  const [, confMd5, domain] = eventChannel.match(/conference-liveArray.(.*)@(.*)/)
  const callIds = session.channelToCallIds.get(eventChannel) || []
  const { action, data, hashKey: callId } = packet
  switch (action) {
    case 'bootObj': {
      const participants = []
      for (const i in data) {
        const participant = { callId: data[i][0], confMd5, domain, eventChannel, ...mutateLiveArrayData(data[i][1]) }
        const { callId, audio, video } = participant
        const isMyCall = callIds.includes(callId)
        if (isMyCall && audio && video && session.calls[callId]) {
          session.calls[callId].updateFromLaChannel(audio.muted, video.muted)
        }
        participants.push(participant)
      }
      return _dispatch(session, { action: ConferenceAction.Bootstrap, participants, confMd5, domain, eventChannel }, callIds)
    }
    case 'add':
      return _dispatch(session, { action: ConferenceAction.Add, callId, confMd5, domain, eventChannel, ...mutateLiveArrayData(data) }, callIds)
    case 'modify': {
      const notification = { action: ConferenceAction.Modify, callId, confMd5, domain, eventChannel, ...mutateLiveArrayData(data) }
      const isMyCall = callIds.includes(callId)
      if (isMyCall) {
        const { audio, video } = notification
        if (audio && video && session.calls[callId]) {
          session.calls[callId].updateFromLaChannel(audio.muted, video.muted)
        }
      }
      return _dispatch(session, notification, callIds)
    }
    case 'del':
      return _dispatch(session, { action: ConferenceAction.Delete, callId, confMd5, domain, eventChannel, ...mutateLiveArrayData(data) }, callIds)
    case 'clear':
      return _dispatch(session, { action: ConferenceAction.Clear, confMd5, domain, eventChannel, confName: packet.name || null }, callIds)
    default:
      return _dispatch(session, { action, data, callId, confMd5, domain, eventChannel }, callIds)
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
