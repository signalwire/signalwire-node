import logger from '../util/logger'
import BrowserSession from '../BrowserSession'
import Conference from './Conference'
import WebRTCCall from './WebRTCCall'
import { Result } from '../messages/Verto'
import { SwEvent } from '../util/constants'
import { VertoMethod, NOTIFICATION_TYPE } from './constants'
import { trigger } from '../services/Handler'
import { State, ConferenceAction } from './constants'
import { MCULayoutEventHandler } from './LayoutHandler'

const _handlePvtEvent = async (session: BrowserSession, pvtData: any) => {
  const { action, callID } = pvtData
  if (!callID || !session.calls[callID]) {
    return logger.warn('Verto pvtData with invalid or unknown callID.')
  }
  switch (action) {
    case 'conference-liveArray-join':
      if (!session.calls[callID].conference) {
        session.calls[callID].conference = new Conference(session)
      }
      session.calls[callID].conference.join(pvtData)
      break
    case 'conference-liveArray-part':
      if (session.calls[callID].conference) {
        session.calls[callID].conference.part(pvtData)
      }
      break
  }
}

const _handleSessionEvent = (session: BrowserSession, eventData: any) => {
  switch (eventData.contentType) {
    case 'layout-info':
    case 'layer-info':
      return MCULayoutEventHandler(session, eventData)
    case 'logo-info': {
      const { logoURL: logo, callID } = eventData
      const notification = { type: NOTIFICATION_TYPE.conferenceUpdate, action: ConferenceAction.LogoInfo, call: session.calls[callID], logo }
      return trigger(SwEvent.Notification, notification, session.uuid)
    }
  }
}

const _buildCall = (session: BrowserSession, params: any, attach: boolean, nodeId: string) => {
  const call = new WebRTCCall(session, {
    id: params.callID,
    remoteSdp: params.sdp,
    destinationNumber: params.callee_id_number,
    remoteCallerName: params.caller_id_name,
    remoteCallerNumber: params.caller_id_number,
    callerName: params.callee_id_name,
    callerNumber: params.callee_id_number,
    attach
  })
  call.nodeId = nodeId
  return call
}

export default (session: BrowserSession, msg: any) => {
  const { id, method, nodeId, params } = msg
  const { callID, eventChannel, eventType } = params
  const attach = method === VertoMethod.Attach
  if (eventType === 'channelPvtData') {
    params.pvtData.nodeId = nodeId
    return _handlePvtEvent(session, params.pvtData)
  }
  if (eventChannel === session.sessionid) {
    return _handleSessionEvent(session, params.eventData)
  }

  if (callID && session.calls.hasOwnProperty(callID)) {
    if (attach) {
      // @ts-ignore
      session.calls[callID]._hangup()
    } else {
      trigger(callID, params, method)
      const msg = new Result(id, method)
      msg.targetNodeId = nodeId
      return session.execute(msg)
    }
  }

  switch (method) {
    case VertoMethod.Punt:
      return session.disconnect()
    case VertoMethod.Invite: {
      const call = _buildCall(session, params, attach, nodeId)
      call.setState(State.Ringing)
      const msg = new Result(id, method)
      msg.targetNodeId = nodeId
      return session.execute(msg)
    }
    case VertoMethod.Attach: {
      const call = _buildCall(session, params, attach, nodeId)
      session.autoRecoverCalls ? call.answer() : call.setState(State.Recovering)
      return trigger(call.id, params, method)
    }
    case VertoMethod.Event:
    case 'webrtc.event':
      if (eventChannel && trigger(eventChannel, params)) {
        return
      }
      logger.warn('Unhandled verto event:', msg)
      break
    case VertoMethod.Info:
      params.type = NOTIFICATION_TYPE.generic
      return trigger(SwEvent.Notification, params, session.uuid)
    case VertoMethod.ClientReady:
      params.type = NOTIFICATION_TYPE.vertoClientReady
      return trigger(SwEvent.Notification, params, session.uuid)
    default:
      logger.warn('Unknown Verto method:', msg)
  }
}
