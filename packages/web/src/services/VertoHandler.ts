import logger from '../../../common/src/util/logger'
import BrowserSession from '../BrowserSession'
import SignalWire from '../SignalWire'
import Verto from '../Verto'

import Dialog from '../rtc/Dialog'
import { Result } from '../../../common/src/messages/Verto'
import { SwEvent, VertoMethod, NOTIFICATION_TYPE } from '../../../common/src/util/constants'
import { trigger, deRegister } from '../../../common/src/services/Handler'
import { State, ConferenceAction } from '../../../common/src/util/constants/dialog'

class VertoHandler {
  constructor(public session: BrowserSession) {
    // console.log('isBlade?', this.isBlade)
    // console.log('isVerto?', this.isVerto)
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
        session.execute(new Result(id, method))
        return
      }
    }

    switch (method) {
      case VertoMethod.Punt:
        if (this.isVerto) {
          // @ts-ignore
          session.logout()
        }
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
          session.execute(new Result(id, method))
        }
        break
      case VertoMethod.Event:
        if (!eventChannel) {
          logger.error('Verto received an unknown event:', params)
          return
        }
        const firstValue = eventChannel.split('.')[0]
        if (session.sessionid === eventChannel && params.eventType === 'channelPvtData') {
          this._handlePvtEvent(params.pvtData)
        } else if (session.subscriptions.hasOwnProperty(eventChannel)) {
          trigger(eventChannel, params)
        } else if (session.subscriptions.hasOwnProperty(firstValue)) {
          trigger(firstValue, params)
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

  private _handlePvtEvent(pvtData: any) {
    const { session } = this
    const { action, laChannel, laName, chatChannel, infoChannel, modChannel, conferenceMemberID, role } = pvtData
    switch (action) {
      case 'conference-liveArray-join': {
        const _liveArrayBootstrap = () => {
          session.broadcast({ channel: laChannel, data: { liveArray: { command: 'bootstrap', context: laChannel, name: laName } } })
        }
        const tmp = {
          // protocol, // TODO: add Blade protocol here
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
        session.subscribe(tmp).then(response => {
          if (response.subscribedChannels.indexOf(laChannel) >= 0) {
            _liveArrayBootstrap()
          }
        })
        break
      }
      case 'conference-liveArray-part': {
        // trigger Notification at a Dialog or Session level.
        // deregister Notification callback at the Dialog level.
        // Cleanup subscriptions for all channels
        if (laChannel && session.subscriptions.hasOwnProperty(laChannel)) {
          const { dialogId = null } = session.subscriptions[laChannel]
          if (dialogId !== null) {
            const notification = { type: NOTIFICATION_TYPE.conferenceUpdate, action: ConferenceAction.Leave, conferenceName: laName, participantId: Number(conferenceMemberID), role }
            if (!trigger(SwEvent.Notification, notification, dialogId, false)) {
              trigger(SwEvent.Notification, notification, session.uuid)
            }
            deRegister(SwEvent.Notification, null, dialogId)
          }
        }
        session.unsubscribe({ channels: [laChannel, chatChannel, infoChannel, modChannel] })
        break
      }
    }
  }
}

export default VertoHandler
