import { v4 as uuidv4 } from 'uuid'
// import logger from './util/logger'
import Connection from './services/Connection'
import { deRegister, register, trigger } from './services/Handler'
import { SwEvent } from './util/constants'
import { BroadcastParams, ISignalWireOptions, SubscribeParams } from './util/interfaces'

export default abstract class BaseSession {
  public uuid: string = uuidv4()
  public sessionid: string = ''
  public subscriptions: { [channel: string]: any } = {}

  protected _connection: Connection = null

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

  abstract validateOptions(): boolean
  abstract async subscribe(params: SubscribeParams): Promise<any>
  abstract async unsubscribe(params: SubscribeParams): Promise<any>
  abstract broadcast(params: BroadcastParams): void
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
  protected abstract _onSocketOpen(): void
  protected abstract _onSocketClose(): void
  protected abstract _onSocketError(error): void
  protected abstract _onSocketMessage(response): void

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
