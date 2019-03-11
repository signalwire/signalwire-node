import logger from '../../../common/src/util/logger'
import BrowserSession from '../BrowserSession'
import SignalWire from '../SignalWire'
import Verto from '../Verto'

import Dialog from '../rtc/Dialog'
import { checkSubscribeResponse } from '../rtc/helpers'
import { Result } from '../../../common/src/messages/Verto'
import { SwEvent, VertoMethod, NOTIFICATION_TYPE } from '../../../common/src/util/constants'
import { trigger, deRegister } from '../../../common/src/services/Handler'
import { State, ConferenceAction } from '../../../common/src/util/constants/dialog'

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
    const { callID: dialogId, eventChannel } = params
    const attach = method === VertoMethod.Attach

    if (dialogId && session.dialogs.hasOwnProperty(dialogId)) {
      if (attach) {
        session.dialogs[dialogId].hangup()
      } else {
        session.dialogs[dialogId].handleMessage(msg)
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
        const dialog = new Dialog(session, {
          id: dialogId,
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
        if (attach) {
          dialog.setState(State.Recovering)
          dialog.answer()
          dialog.handleMessage(msg)
        } else {
          dialog.setState(State.Ringing)
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
        // if (session.sessionid === eventChannel && params.eventType === 'channelPvtData') {
        if (params.eventType === 'channelPvtData') {
          this._handlePvtEvent(params.pvtData)
        } else if (session._existsSubscription(protocol, eventChannel)) {
          trigger(protocol, params, eventChannel)
        } else if (eventChannel === session.sessionid) {
          this._handleSessionEvent(params.eventData)
        } else if (session._existsSubscription(protocol, firstValue)) {
          trigger(protocol, params, firstValue)
        } else if (session.dialogs.hasOwnProperty(eventChannel)) {
          session.dialogs[eventChannel].handleMessage(msg)
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

  get isBlade() {
    return this.session instanceof SignalWire
  }

  get isVerto() {
    return this.session instanceof Verto
  }

  private async _handlePvtEvent(pvtData: any) {
    const { session } = this
    const protocol = session.webRtcProtocol
    const { action, laChannel, laName, chatChannel, infoChannel, modChannel, conferenceMemberID, role } = pvtData
    switch (action) {
      case 'conference-liveArray-join': {
        const _liveArrayBootstrap = () => {
          session.vertoBroadcast({ nodeId: this.nodeId, channel: laChannel, data: { liveArray: { command: 'bootstrap', context: laChannel, name: laName } } })
        }
        const tmp = {
          nodeId: this.nodeId,
          channels: [laChannel],
          handler: ({ data: packet }: any) => {
            let dialogId: string = null
            const dialogIds = Object.keys(session.dialogs)
            if (packet.action === 'bootObj') {
              const me = packet.data.find((pr: [string, []]) => dialogIds.includes(pr[0]))
              if (me instanceof Array) {
                dialogId = me[0]
              }
            } else {
              dialogId = dialogIds.find((id: string) => session.dialogs[id].channels.includes(laChannel))
              // dialogId = dialogIds.find((id: string) => packet.hashKey === id)
            }
            if (dialogId && session.dialogs.hasOwnProperty(dialogId)) {
              const dialog = session.dialogs[dialogId]
              dialog._addChannel(laChannel)
              dialog.handleConferenceUpdate(packet, pvtData)
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
            console.error('liveArray subscription error:', error)
          })
        if (checkSubscribeResponse(result, laChannel)) {
          _liveArrayBootstrap()
        }
        break
      }
      case 'conference-liveArray-part': {
        // trigger Notification at a Dialog or Session level.
        // deregister Notification callback at the Dialog level.
        // Cleanup subscriptions for all channels
        if (laChannel && session._existsSubscription(protocol, laChannel)) {
          const { dialogId = null } = session.subscriptions[protocol][laChannel]
          if (dialogId !== null) {
            const notification = { type: NOTIFICATION_TYPE.conferenceUpdate, action: ConferenceAction.Leave, conferenceName: laName, participantId: Number(conferenceMemberID), role }
            if (!trigger(SwEvent.Notification, notification, dialogId, false)) {
              trigger(SwEvent.Notification, notification, session.uuid)
            }
            deRegister(SwEvent.Notification, null, dialogId)
          }
        }
        session.vertoUnsubscribe({ nodeId: this.nodeId, channels: [laChannel, chatChannel, infoChannel, modChannel] })
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
      case 'logo-info': {
        const notification = { type: NOTIFICATION_TYPE.conferenceUpdate, action: ConferenceAction.LogoInfo, logo: eventData.logoURL }
        trigger(SwEvent.Notification, notification, this.session.uuid)
        break
      }
    }
  }
}

export default VertoHandler
