import { v4 as uuidv4 } from 'uuid'
import logger from './util/logger'
import Connection from './Connection'
import Dialog from './rtc/Dialog'
import { ISignalWireOptions, SubscribeParams, BroadcastParams, ICacheDevices } from './interfaces'
import { validateOptions } from './util/helpers'
import { register, deRegister } from './services/Handler'
import { SwEvent } from './util/constants'
import { getDevices, getResolutions } from './services/RTCService'

export default abstract class BaseSession {
  public uuid: string = uuidv4()
  public sessionid: string = ''
  public dialogs: { [callID: string]: Dialog } = {}
  public subscriptions: { [channel: string]: Object } = {}

  protected _connection: Connection
  protected _devices: ICacheDevices = {}

  constructor(public options: ISignalWireOptions) {
    if (!validateOptions(options, this.constructor.name)) {
      throw new Error('Invalid options for ' + this.constructor.name)
    }
    this._registers()
    this.refreshDevices()
  }

  abstract async subscribe(params: SubscribeParams)
  abstract async unsubscribe(params: SubscribeParams)
  abstract broadcast(params: BroadcastParams)

  connect() {
    if (this._connection instanceof Connection) {
      if (this._connection.connected) {
        logger.warn('Session already connected')
        return
      } else {
        this.disconnect()
      }
    }
    this._connection = new Connection(this)
  }

  disconnect() {
    this.subscriptions = {}
    this.dialogs = {}
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

  refreshDevices() {
    getDevices().then(devices => this._devices = devices)
  }

  get videoDevices() {
    return this._devices.videoinput || {}
  }

  get audioInDevices() {
    return this._devices.audioinput || {}
  }

  get audioOutDevices() {
    return this._devices.audiooutput || {}
  }

  supportedResolutions() {
    return getResolutions()
  }

  private _registers() {
    this.on(SwEvent.SocketOpen, this._onSocketOpen.bind(this))
    this.on(SwEvent.SocketClose, this._onSocketClose.bind(this))
    this.on(SwEvent.SocketError, this._onSocketError.bind(this))
    this.on(SwEvent.SocketMessage, this._onSocketMessage.bind(this))
  }

  protected abstract _onSocketOpen(): void
  protected abstract _onSocketClose(): void
  protected abstract _onSocketError(error): void
  protected abstract _onSocketMessage(response): void

  /**
   * Static Methods
   */

  static on(eventName: string, callback: any) {
    register(eventName, callback)
  }

  static off(eventName: string) {
    deRegister(eventName)
  }
}
