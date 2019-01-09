import { v4 as uuidv4 } from 'uuid'
import logger from './util/logger'
import Connection from './Connection'
import Dialog from './rtc/Dialog'
import { ISignalWireOptions, SubscribeParams, BroadcastParams, ICacheDevices, IDevice, IRtcDevicesParams } from './interfaces'
import { validateOptions } from './util/helpers'
import { register, deRegister } from './services/Handler'
import { SwEvent } from './util/constants'
import { getDevices, getResolutions } from './services/RTCService'


export default abstract class BaseSession {
  public uuid: string = uuidv4()
  public sessionid: string = ''
  public dialogs: { [dialogId: string]: Dialog } = {}
  public subscriptions: { [channel: string]: any } = {}

  protected _connection: Connection
  protected _devices: ICacheDevices = {}

  protected _microphone: IDevice = {}
  protected _webcam: IDevice = {}
  protected _speaker: IDevice = {}

  constructor(public options: ISignalWireOptions) {
    if (!validateOptions(options, this.constructor.name)) {
      throw new Error('Invalid options for ' + this.constructor.name)
    }
    this._registers()
    this.refreshDevices()
  }

  abstract async subscribe(params: SubscribeParams): Promise<any>
  abstract async unsubscribe(params: SubscribeParams): Promise<any>
  abstract broadcast(params: BroadcastParams): void

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

  async refreshDevices() {
    this._devices = await getDevices().catch(error => {
      logger.error('Refresh Devices error:', error)
      return {}
    })
    return Object.assign({}, this._devices)
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

  set defaultRtcDevices(params: IRtcDevicesParams) {
    const { micId, micLabel = '', camId, camLabel = '', speakerId, speakerLabel = '' } = params
    if (micId) {
      this.defaultMicrophone = { id: micId, label: micLabel }
    }
    if (camId) {
      this.defaultWebcam = { id: camId, label: camLabel }
    }
    if (speakerId) {
      this.defaultSpeaker = { id: speakerId, label: speakerLabel }
    }
  }

  get defaultRtcDevices() {
    const {
      _microphone: { id: micId, label: micLabel },
      _webcam: { id: camId, label: camLabel },
      _speaker: { id: speakerId, label: speakerLabel }
    } = this
    return { micId, micLabel, camId, camLabel, speakerId, speakerLabel }
  }

  set defaultMicrophone(device: IDevice) {
    const { id = null } = device
    if (!id || !this.audioInDevices.hasOwnProperty(id)) {
      throw `'${id}' in not a valid deviceId as a microphone.`
    }
    this._microphone = { ...this._microphone, ...device }
  }

  get defaultMicrophone() {
    return Object.assign({}, this._microphone)
  }

  set defaultWebcam(device: IDevice) {
    const { id = null } = device
    if (!id || !this.videoDevices.hasOwnProperty(id)) {
      throw `'${id}' in not a valid deviceId as a webcam.`
    }
    this._webcam = { ...this._webcam, ...device }
  }

  get defaultWebcam() {
    return Object.assign({}, this._webcam)
  }

  set defaultSpeaker(device: IDevice) {
    const { id = null } = device
    if (!id || !this.audioOutDevices.hasOwnProperty(id)) {
      throw `'${id}' in not a valid deviceId as a speaker.`
    }
    this._speaker = { ...this._speaker, ...device }
  }

  get defaultSpeaker() {
    return Object.assign({}, this._speaker)
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

  static uuid(): string {
    return uuidv4()
  }
}
