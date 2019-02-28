import logger from '../../common/src/util/logger'
import BrowserSession from './BrowserSession'
import { SubscribeParams, BroadcastParams, DialogOptions } from '../../common/src/util/interfaces'
import { Login, Broadcast, Subscribe, Unsubscribe } from '../../common/src/messages/Verto'
import Dialog from './rtc/Dialog'
import { SwEvent } from '../../common/src/util/constants'
import { State } from '../../common/src/util/constants/dialog'
import { trigger } from '../../common/src/services/Handler'
import * as Storage from '../../common/src/util/storage/'
import VertoHandler from './services/VertoHandler'

const SESSID = 'vertoSessId'
export default class Verto extends BrowserSession {
  validateOptions() {
    const { host, login, passwd, password } = this.options
    return Boolean(host) && Boolean(login && (passwd || password))
  }

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
      this.dialogs[k].setState(State.Purge)
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
    const response = await this.execute(msg)
    const { unauthorizedChannels = [], subscribedChannels = [] } = response
    if (unauthorizedChannels.length) {
      logger.debug(`Unauthorized Channels: ${unauthorizedChannels.join(', ')}`)
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
    const handler = new VertoHandler(this)
    handler.handleMessage(msg)
  }
}
