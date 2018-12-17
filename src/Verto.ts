import logger from './util/logger'
import BaseSession from './BaseSession'
import { SubscribeParams, BroadcastParams, DialogOptions } from './interfaces'
import { Login, Result, Broadcast, Subscribe, Unsubscribe } from './messages/Verto'
import Dialog from './rtc/Dialog'
import { SwEvent, VertoMethod, DialogState, NOTIFICATION_TYPE, LiveArrayAction } from './util/constants'
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
    Object.keys(this.subscriptions).forEach(eventChannel => {
      this.unsubscribe({ eventChannel })
    })
    this.dialogs = {}
    this.subscriptions = {}
  }

  broadcast(params: BroadcastParams) {
    const { eventChannel, data } = params
    if (!eventChannel) {
      throw new Error('Invalid channel for broadcast: ' + eventChannel)
    }
    const msg = new Broadcast({ sessid: this.sessionid, eventChannel, data })
    this.execute(msg)
  }

  async subscribe(params: SubscribeParams) {
    const { eventChannel, subParams = undefined, handler = null } = params
    if (!eventChannel) {
      throw new Error(`Invalid channel: "${eventChannel}"`)
    }
    if (this._alreadySubscribed(eventChannel)) {
      throw new Error(`Already subscribed to ${eventChannel}!`)
    }
    const msg = new Subscribe({ sessid: this.sessionid, eventChannel, subParams })
    const response = await this.execute(msg)
    if (response.hasOwnProperty('unauthorizedChannels')) {
      logger.error(`Unauthorized Channels: ${response.unauthorizedChannels.join(', ')}`)
      response.unauthorizedChannels.forEach(c => this._removeSubscription(c))
    }
    if (response.hasOwnProperty('subscribedChannels')) {
      response.subscribedChannels.forEach(c => this._addSubscription(c, subParams, handler))
    }
    return response
  }

  async unsubscribe(params: SubscribeParams) {
    const { eventChannel } = params
    const msg = new Unsubscribe({ sessid: this.sessionid, eventChannel })
    const response = await this.execute(msg).catch(error => error)
    if (response.hasOwnProperty('unsubscribedChannels')) {
      response.unsubscribedChannels.forEach(c => this._removeSubscription(c))
    }
    if (response.hasOwnProperty('notSubscribedChannels')) {
      logger.error(`You were not subscribed to channels: ${response.notSubscribedChannels.join(', ')}`)
      response.notSubscribedChannels.forEach(c => this._removeSubscription(c))
    }
    return response
  }

  private _removeSubscription(channel: string) {
    deRegister(channel)
    delete this.subscriptions[channel]
  }

  private _addSubscription(channel: string, obj: Object, handler: Function = null) {
    const old = this.subscriptions[channel] || {}
    this.subscriptions[channel] = Object.assign(old, obj)
    if (handler instanceof Function) {
      register(channel, handler)
    }
  }

  private _alreadySubscribed(channel: string): boolean {
    return this.subscriptions.hasOwnProperty(channel)
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
        if (this.sessionid === eventChannel) {
          trigger(SwEvent.Notification, this._pvtDataChanges(params.pvtData), this.uuid)
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

  private _pvtDataChanges(pvtData: any) {
    const { action, canvasCount, chatID, chatChannel, infoChannel, laName: conferenceName, laChannel: conferenceChannel, conferenceMemberID, role } = pvtData
    let newAction = action
    if (action === 'conference-liveArray-join') {
      newAction = LiveArrayAction.Join
    } else if (action === 'conference-liveArray-part') {
      newAction = LiveArrayAction.Leave
    }
    const type = NOTIFICATION_TYPE.conferenceUpdate
    return { type, action: newAction, chatChannel, infoChannel, conferenceName, conferenceChannel, participantId: Number(conferenceMemberID), role }
  }
}
