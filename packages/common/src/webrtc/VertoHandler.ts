import logger from '../util/logger'
import BrowserSession from '../BrowserSession'
import Call from './Call'
import Conference from './Conference'
import WebRTCCall from './WebRTCCall'
import { checkSubscribeResponse } from './helpers'
import { Result } from '../messages/Verto'
import { SwEvent } from '../util/constants'
import { VertoMethod, NOTIFICATION_TYPE } from './constants'
import { trigger, deRegister } from '../services/Handler'
import { State, ConferenceAction } from './constants'
import { MCULayoutEventHandler } from './LayoutHandler'
import { IWebRTCCall } from './interfaces'

class VertoHandler {
  public nodeId: string

  constructor(public session: BrowserSession) {}

  private _ack(id: number, method: string): void {
    const msg = new Result(id, method)
    if (this.nodeId) {
      msg.targetNodeId = this.nodeId
    }
    this.session.execute(msg)
  }

  handleMessage(msg: any) {
    const { session } = this
    const { id, method, params } = msg
    const { callID, eventChannel, eventType } = params
    const attach = method === VertoMethod.Attach
    if (eventType === 'channelPvtData') {
      return this._handlePvtEvent(params.pvtData)
    }
    if (eventChannel === session.sessionid) {
      return this._handleSessionEvent(params.eventData)
    }

    if (callID && session.calls.hasOwnProperty(callID)) {
      if (attach) {
        session.calls[callID].hangup({}, false)
      } else {
        trigger(callID, params, method)
        this._ack(id, method)
        return
      }
    }
    const _buildCall = () => {
      const call = new WebRTCCall(session, {
        id: callID,
        remoteSdp: params.sdp,
        destinationNumber: params.callee_id_number,
        remoteCallerName: params.caller_id_name,
        remoteCallerNumber: params.caller_id_number,
        callerName: params.callee_id_name,
        callerNumber: params.callee_id_number,
        attach
      })
      call.nodeId = this.nodeId
      return call
    }
    switch (method) {
      case VertoMethod.Punt:
        session.disconnect()
        break
      case VertoMethod.Invite: {
        const call = _buildCall()
        call.setState(State.Ringing)
        this._ack(id, method)
        break
      }
      case VertoMethod.Attach: {
        const call = _buildCall()
        if (this.session.autoRecoverCalls) {
          call.answer()
        } else {
          call.setState(State.Recovering)
        }
        // FIXME: handleMessage?
        // call.handleMessage(msg)
        break
      }
      case VertoMethod.Event:
      case 'webrtc.event':
        if (!eventChannel) {
          logger.error('Malformed verto event:', msg)
          return
        }
        if (trigger(eventChannel, params)) {
          return
        }
        if (session.calls.hasOwnProperty(eventChannel)) {
          // TODO: it's possible this case does not exists anymore
          logger.error('Unhandled verto event:', msg)
        } else {
          trigger(SwEvent.Notification, params, session.uuid)
        }
        break
      case VertoMethod.Info:
        params.type = NOTIFICATION_TYPE.generic
        trigger(SwEvent.Notification, params, session.uuid)
        break
      case VertoMethod.ClientReady:
        params.type = NOTIFICATION_TYPE.vertoClientReady
        trigger(SwEvent.Notification, params, session.uuid)
        break
      default:
        logger.warn('Verto message unknown method:', msg)
    }
  }

  private async _handlePvtEvent(pvtData: any) {
    const { session } = this
    const { action, callID } = pvtData
    if (!callID || !session.calls[callID]) {
      return logger.warn('Verto pvtData with invalid or unknown callID.')
    }
    switch (action) {
      case 'conference-liveArray-join': {
        pvtData.nodeId = this.nodeId
        // @ts-ignore
        session.calls[callID].conference = new Conference(session, pvtData)
        break
      }
      case 'conference-liveArray-part': {
        // @ts-ignore
        session.calls[callID].conference.destroy()
        // trigger Notification at a Call or Session level.
        // deregister Notification callback at the Call level.
        // Cleanup subscriptions for all channels
        // let call: IWebRTCCall = null
        // if (laChannel && session._existsSubscription(protocol, laChannel)) {
        //   const { callId = null } = session.subscriptions[protocol][laChannel]
        //   call = session.calls[callId] || null
        //   if (callId !== null) {
        //     const notification = { type: NOTIFICATION_TYPE.conferenceUpdate, action: ConferenceAction.Leave, conferenceName: laName, participantId: Number(conferenceMemberID), role }
        //     if (!trigger(SwEvent.Notification, notification, callId, false)) {
        //       trigger(SwEvent.Notification, notification, session.uuid)
        //     }
        //     if (call === null) {
        //       deRegister(SwEvent.Notification, null, callId)
        //     }
        //   }
        // }
        // const channels = [laChannel, chatChannel, infoChannel, modChannel]
        // session.vertoUnsubscribe({ nodeId: this.nodeId, channels })
        //   .then(({ unsubscribedChannels = [] }) => {
        //     if (call) {
        //       call.channels = call.channels.filter(c => !unsubscribedChannels.includes(c))
        //     }
        //   })
        //   .catch(error => {
        //     logger.error('liveArray unsubscribe error:', error)
        //   })
        break
      }
    }
  }

  private _handleSessionEvent(eventData: any) {
    switch (eventData.contentType) {
      case 'layout-info':
      case 'layer-info':
        MCULayoutEventHandler(this.session, eventData)
        break
      case 'logo-info': {
        const notification = { type: NOTIFICATION_TYPE.conferenceUpdate, action: ConferenceAction.LogoInfo, logo: eventData.logoURL }
        trigger(SwEvent.Notification, notification, this.session.uuid)
        break
      }
    }
  }
}

export default VertoHandler
