import * as log from 'loglevel'
import { v4 as uuidv4 } from 'uuid'
import logger from './util/logger'
import Connection from './services/Connection'
import Setup from './services/Setup'
import BaseMessage from '../../common/src/messages/BaseMessage'
import { deRegister, register, trigger, deRegisterAll } from './services/Handler'
import BroadcastHandler from './services/BroadcastHandler'
import { ADD, REMOVE, SwEvent, BladeMethod } from './util/constants'
import { NOTIFICATION_TYPE } from './webrtc/constants'
import { BroadcastParams, ISignalWireOptions, SubscribeParams, IBladeConnectResult } from './util/interfaces'
import { Subscription, Connect, Reauthenticate, Ping } from './messages/Blade'
import { isFunction } from './util/helpers'
import { sessionStorage } from './util/storage/'

const KEEPALIVE_INTERVAL = 10 * 1000

export default abstract class BaseSession {
  public uuid: string = uuidv4()
  public sessionid: string = ''
  public subscriptions: { [channel: string]: any } = {}
  public nodeid: string
  public master_nodeid: string
  public expiresAt: number = 0
  public signature: string = null
  public relayProtocol: string = null
  public contexts: string[] = []

  protected connection: Connection = null
  protected _jwtAuth: boolean = false
  protected _doKeepAlive: boolean = false
  protected _keepAliveTimeout: any
  protected _reconnectTimeout: any
  protected _reconnectDelay: number = 5000
  protected _autoReconnect: boolean = true
  protected _idle: boolean = false

  private _executeQueue: { resolve?: Function, msg: any}[] = []
  private _pong: boolean

  constructor(public options: ISignalWireOptions) {
    if (!this.validateOptions()) {
      throw new Error('Invalid init options')
    }
    this._onSocketOpen = this._onSocketOpen.bind(this)
    this._onSocketCloseOrError = this._onSocketCloseOrError.bind(this)
    this._onSocketMessage = this._onSocketMessage.bind(this)
    this._handleLoginError = this._handleLoginError.bind(this)
    this._checkTokenExpiration = this._checkTokenExpiration.bind(this)

    this._attachListeners()
    this.connection = new Connection(this)
  }

  get __logger(): log.Logger {
    return logger
  }

  get connected() {
    return this.connection && this.connection.connected
  }

  get expired() {
    return this.expiresAt && this.expiresAt <= (Date.now() / 1000)
  }

  /**
   * Send a JSON object to the server.
   * @return Promise that will resolve/reject depending on the server response
   */
  execute(msg: BaseMessage): any {
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
   * SignalWire requires project and token
   * Verto requires host, login, passwd OR password
   * @return boolean
   */
  validateOptions() {
    const { project = false, token = false } = this.options
    return Boolean(project && token)
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
   * Remove subscriptions and calls, close WS connection and remove all session listeners.
   * @return void
   */
  async disconnect() {
    clearTimeout(this._reconnectTimeout)
    this.subscriptions = {}
    this._autoReconnect = false
    this.relayProtocol = null
    this._closeConnection()
    await sessionStorage.removeItem(this.signature)
    this._executeQueue = []
    this._detachListeners()
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
   * Refresh the
   * @return void
   */
  async refreshToken(token: string) {
    this.options.token = token
    try {
      if (this.expired) {
        await this.connect()
      } else {
        const br = new Reauthenticate(this.options.project, token, this.sessionid)
        const response = await this.execute(br)
        const { authorization: { expires_at = null } = {} } = response
        this.expiresAt = +expires_at || 0
      }
    } catch (error) {
      logger.error('refreshToken error:', error)
      trigger(SwEvent.Error, error, this.uuid, false)
    }
  }

  /**
   * Define the method to connect the session
   * @abstract
   * @async
   * @return void
   */
  async connect(): Promise<void> {
    if (!this.connection) {
      this.connection = new Connection(this)
    }

    this._attachListeners()
    if (!this.connection.isAlive) {
      this.connection.connect()
    }
  }

  /**
   * Handle login error
   * @return void
   */
  protected _handleLoginError(error: any) {
    this._autoReconnect = false
    trigger(SwEvent.Error, error, this.uuid)
  }

  /**
   * Callback when the ws connection is open
   * @return void
   */
  protected async _onSocketOpen() {
    this._idle = false
    const tokenKey = this._jwtAuth ? 'jwt_token' : 'token'
    const { project, token } = this.options
    const bc = new Connect({ project, [tokenKey]: token }, this.sessionid)
    const response: IBladeConnectResult = await this.execute(bc).catch(this._handleLoginError)
    if (response) {
      this._autoReconnect = true
      const { sessionid, nodeid, master_nodeid, authorization: { expires_at = null, signature = null } = {} } = response
      this.expiresAt = +expires_at || 0
      this.signature = signature
      this.relayProtocol = await Setup(this)
      this._checkTokenExpiration()
      this.sessionid = sessionid
      this.nodeid = nodeid
      this.master_nodeid = master_nodeid
      this._emptyExecuteQueues()
      this._pong = null
      this._keepAlive()
      trigger(SwEvent.Ready, this, this.uuid)
      logger.info('Session Ready!')
    }
  }

  /**
   * Callback when the ws connection is going to close or get an error
   * @return void
   */
  protected _onSocketCloseOrError(event: any): void {
    logger.error(`Socket ${event.type} ${event.message}`)
    if (this.relayProtocol) {
      deRegisterAll(this.relayProtocol)
    }
    for (const sub in this.subscriptions) {
      deRegisterAll(sub)
    }
    this.subscriptions = {}
    this.contexts = []
    if (this.expired) {
      this._idle = true
      this._autoReconnect = false
      this.expiresAt = 0
    }
    if (this._autoReconnect) {
      this._reconnectTimeout = setTimeout(() => this.connect(), this._reconnectDelay)
    }
  }

  /**
   * Callback to handle inbound messages from the ws
   * @return void
   */
  protected _onSocketMessage(response: any) {
    const { method, params } = response
    switch (method) {
      case BladeMethod.Broadcast:
        BroadcastHandler(this, params)
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
    this.on(SwEvent.SocketClose, this._onSocketCloseOrError)
    this.on(SwEvent.SocketError, this._onSocketCloseOrError)
    this.on(SwEvent.SocketMessage, this._onSocketMessage)
  }

  /**
   * Detach listeners for Socket events and disconnect
   * @return void
   */
  private _detachListeners() {
    this.off(SwEvent.SocketOpen, this._onSocketOpen)
    this.off(SwEvent.SocketClose, this._onSocketCloseOrError)
    this.off(SwEvent.SocketError, this._onSocketCloseOrError)
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
  private _closeConnection() {
    this._idle = true
    clearTimeout(this._keepAliveTimeout)
    if (this.connection) {
      this.connection.close()
    }
  }

  /**
   * Set a timer to dispatch a notification when the JWT is going to expire.
   * @return void
   */
  private _checkTokenExpiration() {
    if (!this.expiresAt) {
      return
    }
    const diff = this.expiresAt - (Date.now() / 1000)
    if (diff <= 60) {
      logger.warn('Your JWT is going to expire. You should refresh it to keep the session live.')
      trigger(SwEvent.Notification, { type: NOTIFICATION_TYPE.refreshToken, session: this }, this.uuid, false)
    }
    if (!this.expired) {
      setTimeout(this._checkTokenExpiration, 30 * 1000)
    }
  }

  private _keepAlive() {
    if (this._doKeepAlive !== true) {
      return
    }
    if (this._pong === false) {
      return this._closeConnection()
    }
    this._pong = false
    this.execute(new Ping())
      .then(() => this._pong = true)
      .catch(() => this._pong = false)
    this._keepAliveTimeout = setTimeout(() => this._keepAlive(), KEEPALIVE_INTERVAL)
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
