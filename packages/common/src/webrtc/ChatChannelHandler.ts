import { ConferenceAction } from './constants'
import BrowserSession from '../BrowserSession'

export default function chatChannelHandler(session: BrowserSession, { eventChannel, eventSerno, data }: any) {
  const callIds = session.channelToCallIds.get(eventChannel) || []
  const { direction, from: participantNumber, fromDisplay: participantName, message: messageText, type: messageType } = data
  const params = {
    action: ConferenceAction.ChatMessage, direction, participantNumber, participantName, messageText, messageType, messageId: eventSerno
  }
  if (callIds.length) {
    callIds.forEach(callId => {
      session.calls[callId] && session.calls[callId]._dispatchConferenceUpdate(params)
    })
  } else {
    console.warn('Dispatch global ConferenceUpdate for', params)
  }
}

export const publicChatMethods = {
  // NB: "this" refers to a special object to pass channel and params.
  // See WebRTCCall conferenceJoinHandler method
  sendChatMessage: function(message: string, type: string) {
    const { session, nodeId, channel } = this
    session.vertoBroadcast({ nodeId, channel, data: { action: 'send', message, type } })
  }
}
