import { v4 as uuidv4 } from 'uuid'
import logger from './util/logger'
import Connection from './services/Connection'
import { deRegister, register, trigger } from './services/Handler'
import { BroadcastHandler } from './services/Broadcast'
import { ADD, REMOVE, SwEvent } from './util/constants'
import Cache from './util/Cache'
import { BroadcastParams, ISignalWireOptions, SubscribeParams, IBladeConnectResult } from './util/interfaces'
import { Subscription, Connect } from '../../common/src/messages/Blade'

export default abstract class BaseSession {
  public uuid: string = uuidv4()
  public sessionid: string = ''
  public subscriptions: { [channel: string]: any } = {}
  public nodeid: string
  public master_nodeid: string

  protected _connection: Connection = null

  private _cache: Cache

  constructor(public options: ISignalWireOptions) {
    if (!this.validateOptions()) {
      throw new Error('SignalWire: Invalid init options')
    }
    this._onDisconnect = this._onDisconnect.bind(this)
    this._onSocketOpen = this._onSocketOpen.bind(this)
    this._onSocketClose = this._onSocketClose.bind(this)
    this._onSocketError = this._onSocketError.bind(this)
    this._onSocketMessage = this._onSocketMessage.bind(this)
  }

  protected async _onSocketOpen() {
    const bc = new Connect({ project: this.options.project, token: this.options.token }, this.sessionid)
    const response: IBladeConnectResult = await this.execute(bc)
    this.sessionid = response.sessionid
    this.nodeid = response.nodeid
    this.master_nodeid = response.master_nodeid
    this._cache = new Cache()
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
    switch (method) {
      case 'blade.netcast':
        this._cache.netcastUpdate(params)
        break
      case 'blade.broadcast':
        BroadcastHandler(params)
        break
    }
  }

  validateOptions() {
    const { host, project, token } = this.options
    return Boolean(host) && Boolean(project && token)
  }

  broadcast(params: BroadcastParams) {
    // TODO: to be implemented
  }

  async subscribe({ protocol, channels, handler }: SubscribeParams): Promise<any> {
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

  async unsubscribe({ protocol, channels, handler }: SubscribeParams): Promise<any> {
    const bs = new Subscription({ command: REMOVE, protocol, channels })
    return this.execute(bs)
  }

  abstract async connect(): Promise<void>

  protected checkConnection() {
    if (this._connection) {
      if (this._connection.connected) {
        return
      }
      this.disconnect()
    }

    this._attachListeners()
  }

  disconnect() {
    trigger(SwEvent.Disconnect, null, this.uuid, false)
    this.subscriptions = {}
    if (this._connection) {
      this._connection.close()
    }
    this._connection = null
    this._detachListeners()
  }

  on(eventName: string, callback: Function) {
    register(eventName, callback, this.uuid)
  }

  off(eventName: string, callback?: Function) {
    deRegister(eventName, callback, this.uuid)
  }

  execute(msg: any) {
    return this._connection.send(msg)
  }

  protected abstract _onDisconnect(): void

  protected _removeSubscription(channel: string) {
    deRegister(channel)
    delete this.subscriptions[channel]
  }

  protected _addSubscription(channel: string, handler: Function = null, uniqueId?: string) {
    this.subscriptions[channel] = {}
    if (handler instanceof Function || typeof handler === 'function') {
      register(channel, handler, uniqueId)
    }
  }

  protected _attachListeners() {
    this.on(SwEvent.Disconnect, this._onDisconnect)
    this.on(SwEvent.SocketOpen, this._onSocketOpen)
    this.on(SwEvent.SocketClose, this._onSocketClose)
    this.on(SwEvent.SocketError, this._onSocketError)
    this.on(SwEvent.SocketMessage, this._onSocketMessage)
  }

  protected _detachListeners() {
    this.off(SwEvent.Disconnect, this._onDisconnect)
    this.off(SwEvent.SocketOpen, this._onSocketOpen)
    this.off(SwEvent.SocketClose, this._onSocketClose)
    this.off(SwEvent.SocketError, this._onSocketError)
    this.off(SwEvent.SocketMessage, this._onSocketMessage)
  }

  static on(eventName: string, callback: any) {
    register(eventName, callback)
  }

  static off(eventName: string) {
    deRegister(eventName)
  }

  static uuid(): string {
    return uuidv4()
  }
}
