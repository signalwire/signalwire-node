import { v4 as uuidv4 } from 'uuid'
import logger from './util/logger'
import Connection from './services/Connection'
import { deRegister, register, trigger } from './services/Handler'
import { BroadcastHandler } from './services/Broadcast'
import { ADD, REMOVE, SwEvent, BladeMethod } from './util/constants'
import Cache from './util/Cache'
import { BroadcastParams, ISignalWireOptions, SubscribeParams } from './util/interfaces'
import { Subscription, Connect } from './messages/Blade'
import { isFunction } from './util/helpers'

export default abstract class BaseSession {
  public uuid: string = uuidv4()
  public sessionid: string = ''
  public subscriptions: { [channel: string]: any } = {}
  public nodeid: string
  public master_nodeid: string

  protected connection: Connection = null

  private _cache: Cache
  private _idle: boolean = false
  private _executeQueue: { resolve?: Function, msg: any}[] = []
  private _autoReconnect: boolean = true

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

  /**
   * Send a JSON object to the server.
   * @return Promise that will resolve/reject depending on the server response
   */
  execute(msg: any) {
    if (this._idle) {
      return new Promise(resolve => {
        this._executeQueue.push({ resolve, msg })
      })
    }
    return this.connection.send(msg)
  }

  /**
   * Send raw text to the server.
   * @return void
   */
  executeRaw(text: string): void {
    if (this._idle) {
      this._executeQueue.push({ msg: text })
      return
    }
    this.connection.sendRawText(text)
  }

  /**
   * Validates the options passed in.
   * SignalWire requires host, project and token
   * Verto requires host, login, passwd OR password
   * @return boolean
   */
  validateOptions() {
    const { host, project, token } = this.options
    return Boolean(host) && Boolean(project && token)
  }

  /**
   * Broadcast a message in a protocol - channel
   * @todo Implement it
   * @return void
   */
  broadcast(params: BroadcastParams) { } // TODO: to be implemented

  /**
   * Subscribe to Blade protocol channels
   * @async
   * @return Result of the ADD subscription
   */
  async subscribe({ protocol, channels, handler }: SubscribeParams): Promise<any> {
    const bs = new Subscription({ command: ADD, protocol, channels })
    const result = await this.execute(bs) // FIXME: handle error
    const { failed_channels = [], subscribe_channels = [] } = result
    if (failed_channels.length) {
      failed_channels.forEach((c: string) => this._removeSubscription(c))
      throw new Error(`Failed to subscribe to channels ${failed_channels.join(', ')}`)
    }
    subscribe_channels.forEach((c: string) => this._addSubscription(protocol, handler, c))
    return result
  }

  /**
   * Unsubscribe from Blade protocol channels
   * @async
   * @return Result of the REMOVE subscription
   */
  async unsubscribe({ protocol, channels, handler }: SubscribeParams): Promise<any> {
    const bs = new Subscription({ command: REMOVE, protocol, channels })
    return this.execute(bs) // FIXME: handle error
  }

  /**
   * Disconnect the current session removing all subscriptions and listeners
   * @return void
   */
  disconnect() {
    trigger(SwEvent.Disconnect, null, this.uuid, false)
    this.subscriptions = {}
    if (this.connection) {
      this.connection.close()
    }
    this.connection = null
    this._detachListeners()
  }

  /**
   * Attach a listener to the global session level
   * @return void
   */
  on(eventName: string, callback: Function) {
    register(eventName, callback, this.uuid)
  }

  /**
   * Detach a listener from the global session level
   * @return void
   */
  off(eventName: string, callback?: Function) {
    deRegister(eventName, callback, this.uuid)
  }

  /**
   * Callback fired when the session initiated a disconnect process. Useful to cleanup
   * @abstract
   * @return void
   */
  protected abstract _onDisconnect(): void

  /**
   * Define the method to connect the session
   * @abstract
   * @async
   * @return void
   */
  abstract async connect(): Promise<void>

  /**
   * If the connection is already active do nothing otherwise disconnect the current connection.
   * Setup the default listeners to the session.
   * @return void
   */
  protected setup() {
    if (this.connection) {
      if (this.connection.connected) {
        return
      }
      this.disconnect()
    }

    this._attachListeners()
  }

  /**
   * Callback when the ws connection is open
   * @return void
   */
  protected async _onSocketOpen() {
    const bc = new Connect({ project: this.options.project, token: this.options.token }, this.sessionid)
    const response = await this.execute(bc).catch(error => error)
    const { code, message } = response
    if (code && code == -32002) {
      this._autoReconnect = false
      trigger(SwEvent.Error, message, this.uuid)
      return
    }
    this._autoReconnect = true
    this.sessionid = response.sessionid
    this.nodeid = response.nodeid
    this.master_nodeid = response.master_nodeid
    this._cache = new Cache()
    this._cache.populateFromConnect(response)
    this._emptyExecuteQueues()
    trigger(SwEvent.Ready, this, this.uuid)
  }

  /**
   * Callback when the ws connection is going to close
   * @return void
   */
  protected _onSocketClose() {
    if (this._autoReconnect) {
      setTimeout(() => this.connect(), 1000)
    }
  }

  /**
   * Callback when the ws connection give an error
   * @return void
   */
  protected _onSocketError(error) {
    logger.error('Socket error', error)
  }

  /**
   * Callback to handle inbound messages from the ws
   * @return void
   */
  protected _onSocketMessage(response: any) {
    const { method, params } = response
    switch (method) {
      case BladeMethod.Netcast:
        this._cache.netcastUpdate(params)
        break
      case BladeMethod.Broadcast:
        BroadcastHandler(params)
        break
      case BladeMethod.Disconnect:
        this._idle = true
        break
    }
  }

  /**
   * Remove subscription by key and deregister the related callback
   * @return void
   */
  protected _removeSubscription(channel: string) {
    deRegister(channel)
    delete this.subscriptions[channel]
  }

  /**
   * Add a subscription by key and register a callback if its passed in
   * @return void
   */
  protected _addSubscription(channel: string, handler: Function = null, uniqueId?: string) {
    this.subscriptions[channel] = {}
    if (isFunction(handler)) {
      register(channel, handler, uniqueId)
    }
  }

  /**
   * Attach listeners for Socket events and disconnect
   * @return void
   */
  private _attachListeners() {
    this.on(SwEvent.Disconnect, this._onDisconnect)
    this.on(SwEvent.SocketOpen, this._onSocketOpen)
    this.on(SwEvent.SocketClose, this._onSocketClose)
    this.on(SwEvent.SocketError, this._onSocketError)
    this.on(SwEvent.SocketMessage, this._onSocketMessage)
  }

  /**
   * Detach listeners for Socket events and disconnect
   * @return void
   */
  private _detachListeners() {
    this.off(SwEvent.Disconnect, this._onDisconnect)
    this.off(SwEvent.SocketOpen, this._onSocketOpen)
    this.off(SwEvent.SocketClose, this._onSocketClose)
    this.off(SwEvent.SocketError, this._onSocketError)
    this.off(SwEvent.SocketMessage, this._onSocketMessage)
  }

  /**
   * Execute all the queued messages during the idle period.
   * @return void
   */
  private _emptyExecuteQueues() {
    this._idle = false
    this._executeQueue.forEach(({ resolve, msg }) => {
      if (typeof msg === 'string') {
        this.executeRaw(msg)
      } else {
        resolve(this.execute(msg))
      }
    })

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
