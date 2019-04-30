import logger from '../util/logger'
import BrowserSession from '../BrowserSession'
import Dialog from './Dialog'
import { checkSubscribeResponse } from './helpers'
import { Result } from '../messages/Verto'
import { SwEvent, VertoMethod, NOTIFICATION_TYPE } from '../util/constants'
import { trigger, deRegister } from '../services/Handler'
import { State, ConferenceAction } from '../util/constants/dialog'

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
    const { callID: dialogId, eventChannel, eventType } = params
    const attach = method === VertoMethod.Attach
    if (eventType === 'channelPvtData') {
      return this._handlePvtEvent(params.pvtData, dialogId)
    }

    if (dialogId && session.dialogs.hasOwnProperty(dialogId)) {
      if (attach) {
        session.dialogs[dialogId].hangup({}, false)
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
          dialog.nodeId = this.nodeId
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
        if (session._existsSubscription(protocol, eventChannel)) {
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

  private _retrieveDialogId(packet: any, laChannel: string) {
    const dialogIds = Object.keys(this.session.dialogs)
    if (packet.action === 'bootObj') {
      const me = packet.data.find((pr: [string, []]) => dialogIds.includes(pr[0]))
      if (me instanceof Array) {
        return me[0]
      }
    } else {
      return dialogIds.find((id: string) => this.session.dialogs[id].channels.includes(laChannel))
    }
  }

  private async _handlePvtEvent(pvtData: any, dialogId: string = null) {
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
            const id = dialogId || this._retrieveDialogId(packet, laChannel)
            if (id && session.dialogs.hasOwnProperty(id)) {
              const dialog = session.dialogs[id]
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
            logger.error('liveArray subscription error:', error)
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
        let dialog: Dialog = null
        if (laChannel && session._existsSubscription(protocol, laChannel)) {
          const { dialogId = null } = session.subscriptions[protocol][laChannel]
          dialog = session.dialogs[dialogId] || null
          if (dialogId !== null) {
            const notification = { type: NOTIFICATION_TYPE.conferenceUpdate, action: ConferenceAction.Leave, conferenceName: laName, participantId: Number(conferenceMemberID), role }
            if (!trigger(SwEvent.Notification, notification, dialogId, false)) {
              trigger(SwEvent.Notification, notification, session.uuid)
            }
            if (dialog === null) {
              deRegister(SwEvent.Notification, null, dialogId)
            }
          }
        }
        const channels = [laChannel, chatChannel, infoChannel, modChannel]
        session.vertoUnsubscribe({ nodeId: this.nodeId, channels })
          .then(({ unsubscribedChannels }) => {
            if (dialog) {
              dialog.channels = dialog.channels.filter(c => !unsubscribedChannels.includes(c))
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
      case 'logo-info': {
        const notification = { type: NOTIFICATION_TYPE.conferenceUpdate, action: ConferenceAction.LogoInfo, logo: eventData.logoURL }
        trigger(SwEvent.Notification, notification, this.session.uuid)
        break
      }
    }
  }
}

export default VertoHandler
