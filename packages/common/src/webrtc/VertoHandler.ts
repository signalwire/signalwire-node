import logger from '../util/logger'
import BrowserSession from '../BrowserSession'
import Call from './Call'
import { checkSubscribeResponse } from './helpers'
import { Result } from '../messages/Verto'
import { SwEvent, VertoMethod, NOTIFICATION_TYPE } from '../util/constants'
import { trigger, deRegister } from '../services/Handler'
import { State, ConferenceAction } from '../util/constants/call'

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

    if (callID && session.calls.hasOwnProperty(callID)) {
      if (attach) {
        session.calls[callID].hangup({}, false)
      } else {
        session.calls[callID].handleMessage(msg)
        this._ack(id, method)
        return
      }
    }
    switch (method) {
      case VertoMethod.Punt:
        session.disconnect()
        break
      case VertoMethod.Invite:
      case VertoMethod.Attach:
        const call = new Call(session, {
          id: callID,
          remoteSdp: params.sdp,
          destinationNumber: params.callee_id_number,
          remoteCallerName: params.caller_id_name,
          remoteCallerNumber: params.caller_id_number,
          callerName: params.callee_id_name,
          callerNumber: params.callee_id_number,
          audio: params.sdp.indexOf('m=audio') > 0,
          video: params.sdp.indexOf('m=video') > 0,
          attach
        })
        call.nodeId = this.nodeId
        if (attach) {
          call.setState(State.Recovering)
          call.answer()
          call.handleMessage(msg)
        } else {
          call.setState(State.Ringing)
          this._ack(id, method)
        }
        break
      case VertoMethod.Event:
      case 'webrtc.event':
        if (!eventChannel) {
          logger.error('Verto received an unknown event:', params)
          return
        }
        const protocol = session.webRtcProtocol
        const firstValue = eventChannel.split('.')[0]
        if (session._existsSubscription(protocol, eventChannel)) {
          trigger(protocol, params, eventChannel)
        } else if (eventChannel === session.sessionid) {
          this._handleSessionEvent(params.eventData)
        } else if (session._existsSubscription(protocol, firstValue)) {
          trigger(protocol, params, firstValue)
        } else if (session.calls.hasOwnProperty(eventChannel)) {
          session.calls[eventChannel].handleMessage(msg)
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

  private _retrieveCallId(packet: any, laChannel: string) {
    const callIds = Object.keys(this.session.calls)
    if (packet.action === 'bootObj') {
      const me = packet.data.find((pr: [string, []]) => callIds.includes(pr[0]))
      if (me instanceof Array) {
        return me[0]
      }
    } else {
      return callIds.find((id: string) => this.session.calls[id].channels.includes(laChannel))
    }
  }

  private async _handlePvtEvent(pvtData: any) {
    const { session } = this
    const protocol = session.webRtcProtocol
    const { action, laChannel, laName, chatChannel, infoChannel, modChannel, conferenceMemberID, role, callID } = pvtData
    switch (action) {
      case 'conference-liveArray-join': {
        const _liveArrayBootstrap = () => {
          session.vertoBroadcast({ nodeId: this.nodeId, channel: laChannel, data: { liveArray: { command: 'bootstrap', context: laChannel, name: laName } } })
        }
        const tmp = {
          nodeId: this.nodeId,
          channels: [laChannel],
          handler: ({ data: packet }: any) => {
            const id = callID || this._retrieveCallId(packet, laChannel)
            if (id && session.calls.hasOwnProperty(id)) {
              const call = session.calls[id]
              call._addChannel(laChannel)
              call.handleConferenceUpdate(packet, pvtData)
                .then(error => {
                  if (error === 'INVALID_PACKET') {
                    _liveArrayBootstrap()
                  }
                })
            }
          }
        }
        const result = await session.vertoSubscribe(tmp)
          .catch(error => {
            logger.error('liveArray subscription error:', error)
          })
        if (checkSubscribeResponse(result, laChannel)) {
          _liveArrayBootstrap()
        }
        break
      }
      case 'conference-liveArray-part': {
        // trigger Notification at a Call or Session level.
        // deregister Notification callback at the Call level.
        // Cleanup subscriptions for all channels
        let call: Call = null
        if (laChannel && session._existsSubscription(protocol, laChannel)) {
          const { callId = null } = session.subscriptions[protocol][laChannel]
          call = session.calls[callId] || null
          if (callId !== null) {
            const notification = { type: NOTIFICATION_TYPE.conferenceUpdate, action: ConferenceAction.Leave, conferenceName: laName, participantId: Number(conferenceMemberID), role }
            if (!trigger(SwEvent.Notification, notification, callId, false)) {
              trigger(SwEvent.Notification, notification, session.uuid)
            }
            if (call === null) {
              deRegister(SwEvent.Notification, null, callId)
            }
          }
        }
        const channels = [laChannel, chatChannel, infoChannel, modChannel]
        session.vertoUnsubscribe({ nodeId: this.nodeId, channels })
          .then(({ unsubscribedChannels }) => {
            if (call) {
              call.channels = call.channels.filter(c => !unsubscribedChannels.includes(c))
            }
          })
          .catch(error => {
            logger.error('liveArray unsubscribe error:', error)
          })
        break
      }
    }
  }

  private _handleSessionEvent(eventData: any) {
    switch (eventData.contentType) {
      case 'layer-info': {
        const notification = { type: NOTIFICATION_TYPE.conferenceUpdate, action: ConferenceAction.LayerInfo, ...eventData }
        trigger(SwEvent.Notification, notification, this.session.uuid)
        break
      }
      case 'layout-info': {
        const { canvasType } = eventData
        if (canvasType === 'mcu-personal-canvas') {
          const notification = { type: NOTIFICATION_TYPE.conferenceUpdate, action: ConferenceAction.LayoutInfo, ...eventData }
          trigger(SwEvent.Notification, notification, this.session.uuid)
        }
        break
      }
      case 'logo-info': {
        const notification = { type: NOTIFICATION_TYPE.conferenceUpdate, action: ConferenceAction.LogoInfo, logo: eventData.logoURL }
        trigger(SwEvent.Notification, notification, this.session.uuid)
        break
      }
    }
  }
}

export default VertoHandler
