import logger from './util/logger'
import BaseSession from './BaseSession'
import { Connect, Subscription } from './messages/Blade'
import Cache from './Cache'
import { IBladeConnectResult, SubscribeParams, BroadcastParams } from './interfaces'
import { BroadcastHandler } from './services/Broadcast'
import * as Messaging from './services/Messaging'
import { ADD, REMOVE, SwEvent } from './util/constants'
import { register, trigger } from './services/Handler'
import Calling from './relay/calling/Calling'

export default class SignalWire extends BaseSession {
  public nodeid: string
  public master_nodeid: string
  public services: { [service: string]: string } = {}

  private _callingInstance: Calling = null
  private _cache: Cache = new Cache()

  validateOptions() {
    const { host, project, token } = this.options
    return Boolean(host) && Boolean(project && token)
  }

  get calling() {
    if (this._callingInstance === null) {
      this._callingInstance = new Calling(this)
    }
    return this._callingInstance
  }

  async sendMessage(params: any) {
    const result = await Messaging.sendMessage(this, params)

    Object.defineProperty(result, 'onNotification', {
      writable: false,
      value: callback => {
        register(result.id, callback)
      }
    })

    return result
  }

  getMessage(params: any) {
    const { messageId } = params
    return Messaging.getMessage(this, messageId)
  }

  broadcast(params: BroadcastParams) {
    // TODO: to be implemented
  }

  async subscribe({ protocol, channels, handler }: SubscribeParams) {
    const bs = new Subscription({ command: ADD, protocol, channels })
    const result = await this.execute(bs)
    const { failed_channels = [], subscribe_channels = [] } = result
    if (failed_channels.length) {
      failed_channels.forEach((c: string) => this._removeSubscription(c))
      throw new Error(`Failed to subscribe to channels ${failed_channels.join(', ')}`)
    }
    subscribe_channels.forEach((c: string) => this._addSubscription(protocol, handler, c))
    return result
  }

  async unsubscribe({ protocol, channels, handler }: SubscribeParams) {
    const bs = new Subscription({ command: REMOVE, protocol, channels })
    return this.execute(bs)
  }

  /**
   * protected methods
   */

  protected async _onSocketOpen() {
    const bc = new Connect({ project: this.options.project, token: this.options.token }, this.sessionid)
    const response: IBladeConnectResult = await this.execute(bc)
    this.sessionid = response.sessionid
    this.nodeid = response.nodeid
    this.master_nodeid = response.master_nodeid
    this._cache.populateFromConnect(response)
    trigger(SwEvent.Ready, this, this.uuid)
  }

  protected _onSocketClose() {
    setTimeout(() => this.connect(), 1000)
  }

  protected _onSocketError(error) {
    logger.error('Socket error', error)
  }

  protected _onSocketMessage(response: any) {
    const { method, params } = response
    logger.info('Inbound Message', method, params)
    switch (method) {
      case 'blade.netcast':
        this._cache.netcastUpdate(params)
      break
      case 'blade.broadcast':
        BroadcastHandler(params)
      break
    }
  }
}
