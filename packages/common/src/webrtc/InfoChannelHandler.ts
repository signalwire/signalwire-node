import logger from '../util/logger'
import { ConferenceAction } from './constants'
import BrowserSession from '../BrowserSession'
import { destructConferenceState } from './helpers'

export default function infoChannelHandler(session: BrowserSession, params: any) {
  const { eventData = null, eventChannel, eventSerno = null } = params
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
