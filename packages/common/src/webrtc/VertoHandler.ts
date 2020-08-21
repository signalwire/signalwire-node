import logger from '../util/logger'
import BrowserSession from '../BrowserSession'
import Conference from './Conference'
import Call from './Call'
import { Result } from '../messages/Verto'
import { SwEvent } from '../util/constants'
import { VertoMethod, Notification } from './constants'
import { trigger, registerOnce } from '../services/Handler'
import { State } from './constants'
import { checkIsDirectCall } from './helpers'

const CONF_READY = 'CONF_READY'

const _handlePvtEvent = async (session: BrowserSession, pvtData: any) => {
  const { action, callID } = pvtData
  if (!callID || !session.calls[callID]) {
    return logger.debug('Verto pvtData with invalid or unknown callID.', pvtData)
  }
  // FIXME: screenShare and secondSource do not need conf events.
  const call = session.calls[callID]
  if (!call.isMainCall) {
    return logger.debug('Verto pvtData on screenShare or secondSource legs.', pvtData)
  }
  switch (action) {
    case 'conference-liveArray-join':
      if (!call.conference) {
        call.conference = new Conference(session)
      }
      await call.conference.join(pvtData)
      trigger(callID, null, CONF_READY)
      break
    case 'conference-liveArray-part':
      if (call.conference) {
        call.conference.part(pvtData)
      }
      break
  }
}

const _handleSessionEvent = (session: BrowserSession, eventData: any) => {
  const { contentType, callID } = eventData
  if (!callID || !session.calls.hasOwnProperty(callID)) {
    return logger.debug('Unhandled session event:', eventData)
  }
  const call = session.calls[callID]
  if (!call.conference) {
    return registerOnce(callID, _handleSessionEvent.bind(this, session, eventData), CONF_READY)
  }
  switch (contentType) {
    case 'layout-info':
    case 'layer-info':
      call.conference.updateLayouts(eventData)
      break
    case 'logo-info':
      call.conference.updateLogo(eventData)
      break
    case 'caption-info':
      call.conference.handleCaptionInfo(eventData)
      break
  }
}

const _buildCall = (session: BrowserSession, params: any, attach: boolean, nodeId: string) => {
  const call = new Call(session, {
    id: params.callID,
    remoteSdp: params.sdp,
    destinationNumber: params.callee_id_number,
    remoteCallerName: params.caller_id_name,
    remoteCallerNumber: params.caller_id_number,
    callerName: params.callee_id_name,
    callerNumber: params.callee_id_number,
    attach,
    secondSource: /;second-source$/.test(params.callee_id_number),
    screenShare: /;screen$/.test(params.callee_id_number),
    shakenCheck: params.shaken_check || '',
    shakenResult: params.shaken_result || '',
  })

  const hasAudioLine = params.sdp.indexOf('m=audio') !== -1
  if (!hasAudioLine) {
    call.options.audio = false
    call.options.micId = null
    call.options.micLabel = null
  }
  const hasVideoLine = params.sdp.indexOf('m=video') !== -1
  if (!hasVideoLine) {
    call.options.video = false
    call.options.camId = null
    call.options.camLabel = null
  }
  call.nodeId = nodeId
  call.isDirect = checkIsDirectCall(params)
  return call
}

export default (session: BrowserSession, msg: any) => {
  const { id, method, nodeId, params } = msg
  const { callID, eventChannel, eventType } = params
  if (eventType === 'channelPvtData') {
    params.pvtData.nodeId = nodeId
    return _handlePvtEvent(session, params.pvtData)
  }
  if (eventChannel === session.sessionid) {
    return _handleSessionEvent(session, params.eventData)
  }

  if (callID && session.calls.hasOwnProperty(callID)) {
    trigger(callID, params, method)
    if (method !== VertoMethod.Attach) {
      const msg = new Result(id, method)
      msg.targetNodeId = nodeId
      session.execute(msg)
    }
    return
  }
  const attach = method === VertoMethod.Attach
  switch (method) {
    case VertoMethod.Ping:
      const msg = new Result(id, method)
      msg.targetNodeId = nodeId
      return session.execute(msg)
    case VertoMethod.Punt:
      session.purge()
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
      return trigger(call.id, params, method)
    }
    case VertoMethod.Event:
    case 'webrtc.event': {
      const { subscribedChannel } = params
      if (subscribedChannel && trigger(subscribedChannel, params)) {
        return
      }
      if (eventChannel) {
        const channelType = eventChannel.split('.')[0]
        const global = trigger(channelType, params)
        const specific = trigger(eventChannel, params)
        if (global || specific) {
          return
        }
      }
      params.type = Notification.Generic
      return trigger(SwEvent.Notification, params, session.uuid)
    }
    case VertoMethod.Info:
      params.type = Notification.Generic
      return trigger(SwEvent.Notification, params, session.uuid)
    case VertoMethod.ClientReady:
      params.type = Notification.VertoClientReady
      return trigger(SwEvent.Notification, params, session.uuid)
    case VertoMethod.Announce:
      params.type = Notification.Announce
      return trigger(SwEvent.Notification, params, session.uuid)
    default:
      logger.debug('Unknown Verto method:', method, params)
      params.type = method
      return trigger(SwEvent.Notification, params, session.uuid)
  }
}
