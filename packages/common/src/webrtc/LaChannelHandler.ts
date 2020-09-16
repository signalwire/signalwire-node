import { mutateLiveArrayData } from '../util/helpers'
import { ConferenceAction } from './constants'
import BrowserSession from '../BrowserSession'

export default function (session: BrowserSession, { eventChannel, eventSerno, data: packet }: any) {
  const [, confMd5, domain] = eventChannel.match(/conference-liveArray.(.*)@(.*)/)
  const callIds = session.channelToCallIds.get(eventChannel) || []
  const { action, data, hashKey: callId, wireSerno } = packet
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
      return _dispatch(session, { action: ConferenceAction.Bootstrap, participants, confMd5, domain, eventChannel, eventSerno, wireSerno }, callIds)
    }
    case 'add':
      return _dispatch(session, { action: ConferenceAction.Add, callId, confMd5, domain, eventChannel, eventSerno, wireSerno, ...mutateLiveArrayData(data) }, callIds)
    case 'modify': {
      const notification = { action: ConferenceAction.Modify, callId, confMd5, domain, eventChannel, eventSerno, wireSerno, ...mutateLiveArrayData(data) }
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
      return _dispatch(session, { action: ConferenceAction.Delete, callId, confMd5, domain, eventChannel, eventSerno, wireSerno, ...mutateLiveArrayData(data) }, callIds)
    case 'clear':
      return _dispatch(session, { action: ConferenceAction.Clear, confMd5, domain, eventChannel, eventSerno, wireSerno, confName: packet.name || null }, callIds)
    default:
      return _dispatch(session, { action, data, callId, confMd5, domain, eventChannel, eventSerno, wireSerno }, callIds)
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
