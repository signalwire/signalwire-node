import logger from '../util/logger'
import { ConferenceAction } from './constants'
import BrowserSession from '../BrowserSession'

// TODO: clear serno
let lastSerno = 0

export default function infoChannelHandler(session: BrowserSession, params: any) {
  const { eventData = null, eventChannel, eventSerno = null } = params
  if (!eventData) {
    return logger.warn('Unknown conference info event', params)
  }
  if (eventSerno !== null && eventSerno === lastSerno) {
    return logger.debug('Skip Info event:', eventSerno, 'last was:', lastSerno)
  }
  lastSerno = eventSerno
  const callIds = session.channelToCallIds.get(eventChannel) || []
  switch (eventData.contentType) {
    case 'layout-info': {
      if (callIds.length) {
        callIds.forEach(callId => {
          session.calls[callId] && session.calls[callId].updateLayouts(eventData)
        })
      } else {
        console.warn('Dispatch global layout-info with', params)
      }
      break
    }
    case 'conference-info':
      const { contentType, ...rest } = eventData
      return _dispatch(session, { action: ConferenceAction.ConferenceInfo, ...rest }, callIds)
    case 'caption-info': {
      if (callIds.length) {
        callIds.forEach(callId => {
          session.calls[callId] && session.calls[callId].handleCaptionInfo(eventData)
        })
      } else {
        console.warn('Dispatch global caption-info with', params)
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
