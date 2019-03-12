import { v4 as uuidv4 } from 'uuid'
import logger from './util/logger'
import Connection from './services/Connection'
import BaseMessage from '../../common/src/messages/BaseMessage'
import { deRegister, register, trigger, deRegisterAll } from './services/Handler'
import { BroadcastHandler } from './services/Broadcast'
import { ADD, REMOVE, SwEvent, BladeMethod } from './util/constants'
import Cache from './util/Cache'
import { BroadcastParams, ISignalWireOptions, SubscribeParams, Constructable } from './util/interfaces'
import { Subscription, Connect } from './messages/Blade'
import { isFunction } from './util/helpers'
import Relay from './relay/Relay'

export default abstract class BaseSession {
  public uuid: string = uuidv4()
  public sessionid: string = ''
  public subscriptions: { [channel: string]: any } = {}
  public nodeid: string
  public master_nodeid: string

  protected connection: Connection = null
  protected _relayInstances: { [service: string]: Relay } = {}

  private _cache: Cache
  private _idle: boolean = false
  private _executeQueue: { resolve?: Function, msg: any}[] = []
  private _autoReconnect: boolean = true

  constructor(public options: ISignalWireOptions) {
    if (!this.validateOptions()) {
      throw new Error('SignalWire: Invalid init options')
    }
    this._onSocketOpen = this._onSocketOpen.bind(this)
    this._onSocketClose = this._onSocketClose.bind(this)
    this._onSocketError = this._onSocketError.bind(this)
    this._onSocketMessage = this._onSocketMessage.bind(this)
  }

  get __logger() {
    return logger
  }

  get connected() {
    return this.connection && this.connection.connected
  }

  /**
   * Send a JSON object to the server.
   * @return Promise that will resolve/reject depending on the server response
   */
  execute(msg: BaseMessage) {
    if (this._idle) {
      return new Promise(resolve => this._executeQueue.push({ resolve, msg }))
    }
    if (!this.connected) {
      return new Promise(resolve => {
        this._executeQueue.push({ resolve, msg })
        this.connect()
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
    const result = await this.execute(bs)
    const { failed_channels = [], subscribe_channels = [] } = result
    if (failed_channels.length) {
      failed_channels.forEach((channel: string) => this._removeSubscription(protocol, channel))
    }
    subscribe_channels.forEach((channel: string) => this._addSubscription(protocol, handler, channel))
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
   * Purge subscriptions and dialogs, close WS connection and remove all session listeners.
   * @return void
   */
  disconnect() {
    trigger(SwEvent.Disconnect, null, this.uuid, false)
    this._removeConnection()
    this.purge()
    this._executeQueue = []
    this._detachListeners()
  }

  /**
   * Unsubscribe all subscriptions
   * @return void
   */
  purge() {
    Object.keys(this.subscriptions).forEach(protocol => {
      this.unsubscribe({ protocol, channels: Object.keys(this.subscriptions[protocol]) })
    })
    this.subscriptions = {}
  }

  /**
   * Attach a listener to the global session level
   * @return void
   */
  on(eventName: string, callback: Function) {
    register(eventName, callback, this.uuid)
    return this
  }

  /**
   * Detach a listener from the global session level
   * @return void
   */
  off(eventName: string, callback?: Function) {
    deRegister(eventName, callback, this.uuid)
    return this
  }

  /**
   * Define the method to connect the session
   * @abstract
   * @async
   * @return void
   */
  abstract async connect(): Promise<void>

  protected async _vertoLogin?(): Promise<void>

  /**
   * If the connection is already active do nothing otherwise disconnect the current connection.
   * Setup the default listeners to the session.
   * @return void
   */
  protected setup() {
    if (this.connection) {
      if (this.connection.isAlive) {
        return
      }
      this._removeConnection()
    }

    this._attachListeners()
  }

  /**
   * Callback when the ws connection is open
   * @return void
   */
  protected async _onSocketOpen() {
    this._idle = false
    const bc = new Connect({ project: this.options.project, token: this.options.token }, this.sessionid)
    const response = await this.execute(bc)
      .catch(error => {
        this._autoReconnect = false
        trigger(SwEvent.Error, error, this.uuid)
      })
    if (response) {
      this._autoReconnect = true
      this.sessionid = response.sessionid
      this.nodeid = response.nodeid
      this.master_nodeid = response.master_nodeid
      this._cache = new Cache()
      this._cache.populateFromConnect(response)
      if (this._vertoLogin) {
        await this._vertoLogin()
      }
      this._emptyExecuteQueues()
      trigger(SwEvent.Ready, this, this.uuid)
    }
  }

  /**
   * Callback when the ws connection is going to close
   * @return void
   */
  protected _onSocketClose() {
    this._destroyRelayInstances()
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
  protected _removeSubscription(protocol: string, channel?: string) {
    if (!this._existsSubscription(protocol, channel)) {
      return
    }
    if (channel) {
      delete this.subscriptions[protocol][channel]
      deRegister(protocol, null, channel)
    } else {
      delete this.subscriptions[protocol]
      deRegisterAll(protocol)
    }
  }

  /**
   * Add a subscription by key and register a callback if its passed in
   * @return void
   */
  protected _addSubscription(protocol: string, handler: Function = null, channel: string) {
    if (this._existsSubscription(protocol, channel)) {
      return
    }
    if (!this._existsSubscription(protocol)) {
      this.subscriptions[protocol] = {}
    }
    this.subscriptions[protocol][channel] = {}
    if (isFunction(handler)) {
      register(protocol, handler, channel)
    }
  }

  /**
   * Creates a new Relay instance if not already present.
   * @return Relay object
   */
  protected _addRelayInstance(service: string, klass: Constructable<Relay>): Relay {
    if (!this._relayInstances.hasOwnProperty(service)) {
      this._relayInstances[service] = new klass(this)
    }
    return this._relayInstances[service]
  }

  /**
   * Check if a subscription for this protocol-channel already exists
   * @return boolean
   */
  public _existsSubscription(protocol: string, channel?: string) {
    if (this.subscriptions.hasOwnProperty(protocol)) {
      if (!channel || (channel && this.subscriptions[protocol].hasOwnProperty(channel))) {
        return true
      }
    }
    return false
  }

  /**
   * Attach listeners for Socket events and disconnect
   * @return void
   */
  private _attachListeners() {
    this._detachListeners()
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
    this._executeQueue.forEach(({ resolve, msg }) => {
      if (typeof msg === 'string') {
        this.executeRaw(msg)
      } else {
        resolve(this.execute(msg))
      }
    })
  }

  /**
   * Close and remove the current connection.
   * @return void
   */
  private _removeConnection() {
    this._idle = true
    if (this.connection) {
      this._autoReconnect = false
      this.connection.close()
    }
    this.connection = null
  }

  /**
   * Remove all Relay instances attached to this session. Cleanup on socket close.
   * @return void
   */
  private _destroyRelayInstances() {
    Object.keys(this._relayInstances).forEach(service => {
      delete this._relayInstances[service]
      this._relayInstances[service] = null
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
