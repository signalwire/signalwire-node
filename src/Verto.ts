import logger from './util/logger'
import BaseSession from './BaseSession'
import { SubscribeParams, BroadcastParams, DialogOptions } from './interfaces'
import { Login, Result, Broadcast, Subscribe, Unsubscribe } from './messages/Verto'
import Dialog from './rtc/Dialog'
import { SwEvent, VertoMethod, DialogState, NOTIFICATION_TYPE, ConferenceAction } from './util/constants'
import { trigger, register, deRegister } from './services/Handler'
import * as Storage from './util/storage'

const SESSID = 'vertoSessId'
export default class Verto extends BaseSession {

  newCall(options: DialogOptions) {
    const { destinationNumber = null } = options
    if (!destinationNumber) {
      throw new Error('Verto.newCall() error: destinationNumber is required.')
    }
    const dialog = new Dialog(this, options)
    dialog.invite()
    return dialog
  }

  logout() {
    logger.warn('Verto logout')
    this.purge()
    this.disconnect()
  }

  purge() {
    logger.warn('Verto purge')
    Object.keys(this.dialogs).forEach(k => {
      this.dialogs[k].setState(DialogState.Purge)
    })
    this.dialogs = {}
    this.unsubscribe({ channels: Object.keys(this.subscriptions) })
    this.subscriptions = {}
  }

  broadcast({ channel: eventChannel = '', data }: BroadcastParams) {
    if (!eventChannel) {
      throw new Error('Invalid channel for broadcast: ' + eventChannel)
    }
    const msg = new Broadcast({ sessid: this.sessionid, eventChannel, data })
    this.execute(msg).catch(error => error)
  }

  async subscribe({ channels: eventChannel = [], handler }: SubscribeParams) {
    eventChannel = eventChannel.filter((channel: string) => channel && !this.subscriptions.hasOwnProperty(channel))
    if (!eventChannel.length) {
      return
    }
    const msg = new Subscribe({ sessid: this.sessionid, eventChannel })
    const response = await this.execute(msg).catch(error => error)
    const { unauthorizedChannels = [], subscribedChannels = [] } = response
    if (unauthorizedChannels.length) {
      logger.error(`Unauthorized Channels: ${unauthorizedChannels.join(', ')}`)
      unauthorizedChannels.forEach((c: string) => this._removeSubscription(c))
    }
    subscribedChannels.forEach((c: string) => this._addSubscription(c, handler))
    return response
  }

  async unsubscribe({ channels: eventChannel = [] }: SubscribeParams) {
    eventChannel = eventChannel.filter((channel: string) => channel && this.subscriptions.hasOwnProperty(channel))
    if (!eventChannel.length) {
      return
    }
    const msg = new Unsubscribe({ sessid: this.sessionid, eventChannel })
    const response = await this.execute(msg).catch(error => error)
    const { unsubscribedChannels = [], notSubscribedChannels = [] } = response
    unsubscribedChannels.forEach((c: string) => this._removeSubscription(c))
    notSubscribedChannels.forEach((c: string) => this._removeSubscription(c))
    return response
  }

  private _removeSubscription(channel: string) {
    deRegister(channel)
    delete this.subscriptions[channel]
  }

  private _addSubscription(channel: string, handler: Function = null) {
    this.subscriptions[channel] = {}
    if (handler instanceof Function) {
      register(channel, handler)
    }
  }

  protected async _onSocketOpen() {
    const sessid = await Storage.getItem(SESSID)
    const { login, password, passwd, userVariables } = this.options
    const msg = new Login(login, (password || passwd), sessid, userVariables)
    const response = await this.execute(msg)
      .catch(error => {
        trigger(SwEvent.Error, error, this.uuid)
      })
    if (response) {
      this.sessionid = response.sessid
      Storage.setItem(SESSID, this.sessionid)
      trigger(SwEvent.Ready, this, this.uuid)
    }
  }

  protected _onSocketClose() {
    logger.info('Verto socket close')
    setTimeout(() => this.connect(), 1000)
  }

  protected _onSocketError(error) {
    logger.error('Verto socket error', error)
  }

  protected _onSocketMessage(msg: any) {
    // TODO: Move this switch in a service to re-use it under Blade!
    const { id, method, params } = msg
    const { callID: dialogId, eventChannel } = params
    const attach = method === VertoMethod.Attach

    if (dialogId && this.dialogs.hasOwnProperty(dialogId)) {
      if (attach) {
        this.dialogs[dialogId].hangup()
      } else {
        this.dialogs[dialogId].handleMessage(msg)
        this.execute(new Result(id, method))
        return
      }
    }

    switch (method) {
      case VertoMethod.Punt:
        this.logout()
        break
      case VertoMethod.Invite:
      case VertoMethod.Attach:
        const dialog = new Dialog(this, {
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
          dialog.setState(DialogState.Recovering)
          dialog.answer()
          dialog.handleMessage(msg)
        } else {
          dialog.setState(DialogState.Ringing)
          this.execute(new Result(id, method))
        }
        break
      case VertoMethod.Event:
        if (!eventChannel) {
          logger.error('Verto received an unknown event:', params)
          return
        }
        const firstValue = eventChannel.split('.')[0]
        if (this.sessionid === eventChannel && params.eventType === 'channelPvtData') {
          this._handlePvtEvent(params.pvtData)
        } else if (this.subscriptions.hasOwnProperty(eventChannel)) {
          trigger(eventChannel, params)
        } else if (this.subscriptions.hasOwnProperty(firstValue)) {
          trigger(firstValue, params)
        } else if (this.dialogs.hasOwnProperty(eventChannel)) {
          this.dialogs[eventChannel].handleMessage(msg)
        } else {
          trigger(SwEvent.Notification, params, this.uuid)
        }
        break
      case VertoMethod.Info:
        params.type = NOTIFICATION_TYPE.generic
        trigger(SwEvent.Notification, params, this.uuid)
        break
      case VertoMethod.ClientReady:
        params.type = NOTIFICATION_TYPE.vertoClientReady
        trigger(SwEvent.Notification, params, this.uuid)
        break
      default:
        logger.warn('Verto message unknown method:', msg)
    }
  }

  private _handlePvtEvent(pvtData: any) {
    const { action, laChannel, laName, chatChannel, infoChannel, modChannel, conferenceMemberID, role } = pvtData
    switch (action) {
      case 'conference-liveArray-join': {
        const _liveArrayBootstrap = () => {
          this.broadcast({ channel: laChannel, data: { liveArray: { command: 'bootstrap', context: laChannel, name: laName } } })
        }
        const tmp = {
          channels: [laChannel],
          handler: ({ data: packet }: any) => {
            let dialogId: string = null
            const dialogIds = Object.keys(this.dialogs)
            if (packet.action === 'bootObj') {
              const me = packet.data.find((pr: [string, []]) => dialogIds.includes(pr[0]))
              if (me instanceof Array) {
                dialogId = me[0]
              }
            } else {
              dialogId = dialogIds.find((id: string) => this.dialogs[id].channels.includes(laChannel))
            }
            if (dialogId && this.dialogs.hasOwnProperty(dialogId)) {
              const dialog = this.dialogs[dialogId]
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
        this.subscribe(tmp).then(response => {
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
        if (laChannel && this.subscriptions.hasOwnProperty(laChannel)) {
          const { dialogId = null } = this.subscriptions[laChannel]
          if (dialogId !== null) {
            const notification = { type: NOTIFICATION_TYPE.conferenceUpdate, action: ConferenceAction.Leave, conferenceName: laName, participantId: Number(conferenceMemberID), role }
            if (!trigger(SwEvent.Notification, notification, dialogId, false)) {
              trigger(SwEvent.Notification, notification, this.uuid)
            }
            deRegister(SwEvent.Notification, null, dialogId)
          }
        }
        this.unsubscribe({ channels: [laChannel, chatChannel, infoChannel, modChannel] })
        break
      }
    }
  }
}
