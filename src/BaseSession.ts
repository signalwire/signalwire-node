import { v4 as uuidv4 } from 'uuid'
// import logger from './util/logger'
import Connection from './Connection'
import { ISignalWireOptions, SubscribeParams, BroadcastParams } from './interfaces'
import { register, deRegister } from './services/Handler'
import { SwEvent } from './util/constants'

export default abstract class BaseSession {
  public uuid: string = uuidv4()
  public sessionid: string = ''
  public subscriptions: { [channel: string]: any } = {}

  protected _connection: Connection = null

  constructor(public options: ISignalWireOptions) {
    if (!this.validateOptions()) {
      throw new Error('SignalWire: Invalid init options')
    }
    this.on(SwEvent.SocketOpen, this._onSocketOpen.bind(this))
    this.on(SwEvent.SocketClose, this._onSocketClose.bind(this))
    this.on(SwEvent.SocketError, this._onSocketError.bind(this))
    this.on(SwEvent.SocketMessage, this._onSocketMessage.bind(this))
  }

  abstract validateOptions(): boolean
  abstract async subscribe(params: SubscribeParams): Promise<any>
  abstract async unsubscribe(params: SubscribeParams): Promise<any>
  abstract broadcast(params: BroadcastParams): void
  abstract async connect(): Promise<void>

  disconnect() {
    this.subscriptions = {}
    if (this._connection) {
      this._connection.close()
    }
    this._connection = null
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
    if (handler instanceof Function) {
      register(channel, handler, uniqueId)
    }
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
