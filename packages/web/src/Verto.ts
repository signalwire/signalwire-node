import logger from '../../common/src/util/logger'
import BrowserSession from './BrowserSession'
import { SubscribeParams, BroadcastParams, DialogOptions } from '../../common/src/util/interfaces'
import { Login, Broadcast, Subscribe, Unsubscribe } from '../../common/src/messages/Verto'
import Dialog from './rtc/Dialog'
import { SwEvent } from '../../common/src/util/constants'
import { trigger } from '../../common/src/services/Handler'
import * as Storage from '../../common/src/util/storage/'
import VertoHandler from './services/VertoHandler'

const SESSID = 'vertoSessId'
export const VERTO_PROTOCOL = 'verto-protocol'
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

  broadcast({ channel: eventChannel = '', data }: BroadcastParams) {
    if (!eventChannel) {
      throw new Error('Invalid channel for broadcast: ' + eventChannel)
    }
    const msg = new Broadcast({ sessid: this.sessionid, eventChannel, data })
    this.execute(msg).catch(error => error)
  }

  async subscribe({ channels: eventChannel = [], handler }: SubscribeParams) {
    eventChannel = eventChannel.filter((channel: string) => channel && !this._existsSubscription(VERTO_PROTOCOL, channel))
    if (!eventChannel.length) {
      return
    }
    const msg = new Subscribe({ sessid: this.sessionid, eventChannel })
    const response = await this.execute(msg)
    const { unauthorizedChannels = [], subscribedChannels = [] } = response
    if (unauthorizedChannels.length) {
      logger.debug(`Unauthorized Channels: ${unauthorizedChannels.join(', ')}`)
      unauthorizedChannels.forEach((channel: string) => this._removeSubscription(VERTO_PROTOCOL, channel))
    }
    subscribedChannels.forEach((channel: string) => this._addSubscription(VERTO_PROTOCOL, handler, channel))
    return response
  }

  async unsubscribe({ channels: eventChannel = [] }: SubscribeParams) {
    eventChannel = eventChannel.filter((channel: string) => channel && this._existsSubscription(VERTO_PROTOCOL, channel))
    if (!eventChannel.length) {
      return
    }
    const msg = new Unsubscribe({ sessid: this.sessionid, eventChannel })
    const response = await this.execute(msg).catch(error => error)
    const { unsubscribedChannels = [], notSubscribedChannels = [] } = response
    unsubscribedChannels.forEach((channel: string) => this._removeSubscription(VERTO_PROTOCOL, channel))
    notSubscribedChannels.forEach((channel: string) => this._removeSubscription(VERTO_PROTOCOL, channel))
    return response
  }

  protected async _onDisconnect() {
    // TODO: sent unsubscribe for all subscriptions?
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

  get webRtcProtocol() {
    return VERTO_PROTOCOL
  }
}
