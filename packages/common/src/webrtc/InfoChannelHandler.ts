import logger from '../util/logger'
import { ConferenceAction } from './constants'
import BrowserSession from '../BrowserSession'
import { destructConferenceState } from './helpers'

export default function infoChannelHandler(session: BrowserSession, params: any) {
  const { eventData = null, eventChannel, eventSerno = null, data } = params
  if (data) {
    return logger.debug('Unhandled conference info event', params)
  }
  if (!eventData) {
    return logger.warn('Unknown conference info event', params)
  }

  const callIds = session.channelToCallIds.get(eventChannel) || []
  switch (eventData.contentType) {
    case 'layout-info': {
      if (callIds.length) {
        callIds.forEach(callId => {
          session.calls[callId] && session.calls[callId].updateLayouts(eventData)
        })
      } else {
        // TODO: handle global layout-info
      }
      break
    }
    case 'conference-info':
      const { conferenceState, messages = [] } = eventData
      return _dispatch(session, { action: ConferenceAction.ConferenceInfo, eventChannel, eventSerno, conferenceState: destructConferenceState(conferenceState), messages }, callIds)
    case 'member-talk-state':
      const { callID, memberID, talking } = eventData
      return _dispatch(session, { action: ConferenceAction.MemberTalkState, eventChannel, eventSerno, callID, memberID, talking }, callIds)
    case 'member-ms-state':
      console.warn('InfoChannel member-ms-state', params)
      break
    case 'caption-info': {
      if (callIds.length) {
        callIds.forEach(callId => {
          session.calls[callId] && session.calls[callId].handleCaptionInfo(eventData)
        })
      } else {
        // TODO: handle global caption-info
      }
      break
    }
    default:
      logger.warn('Unknown conference info event', params)
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

function _infoCommand(params: any) {
  const { session, nodeId, channel, ...rest } = this
  if (!channel) {
    return console.warn('Missing modChannel')
  }
  const data = { application: 'conf-control', ...rest, ...params }
  session.vertoBroadcast({ nodeId, channel, data })
}

export const publicInfoMethods = {
  // NB: "this" refers to a special object to pass channel and params.
  // See WebRTCCall conferenceJoinHandler method
  infoCommand: function (command: string, id: string, value: any) {
    return _infoCommand.call(this, { command, id, value })
  },
  getLayoutInfo: function () {
    const params = { command: 'get-layout-info' }
    return _infoCommand.call(this, params)
  },
  getConferenceState: function () {
    const params = { command: 'get-conference-state' }
    return _infoCommand.call(this, params)
  },
}
