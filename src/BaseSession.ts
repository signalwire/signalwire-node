import { v4 as uuidv4 } from 'uuid'
import logger from './util/logger'
import Connection from './Connection'
import Dialog from './rtc/Dialog'
import { ISignalWireOptions, SubscribeParams, BroadcastParams, ICacheDevices, IDevice, IRtcDevicesParams } from './interfaces'
import { validateOptions } from './util/helpers'
import { register, deRegister, trigger, registerOnce } from './services/Handler'
import { SwEvent, NOTIFICATION_TYPE } from './util/constants'
import { getDevices, getResolutions, checkPermissions, assureDeviceId } from './services/RTCService'

export default abstract class BaseSession {
  public uuid: string = uuidv4()
  public sessionid: string = ''
  public dialogs: { [dialogId: string]: Dialog } = {}
  public subscriptions: { [channel: string]: any } = {}
  public defaultAudioConstraints: boolean | MediaTrackConstraints = true
  public defaultVideoConstraints: boolean | MediaTrackConstraints = false

  protected _connection: Connection
  protected _devices: ICacheDevices = {}

  protected _microphone: IDevice = {}
  protected _webcam: IDevice = {}
  protected _speaker: IDevice = {}

  constructor(public options: ISignalWireOptions) {
    if (!validateOptions(options, this.constructor.name)) {
      throw new Error('Invalid options for ' + this.constructor.name)
    }
    this.on(SwEvent.SocketOpen, this._onSocketOpen.bind(this))
    this.on(SwEvent.SocketClose, this._onSocketClose.bind(this))
    this.on(SwEvent.SocketError, this._onSocketError.bind(this))
    this.on(SwEvent.SocketMessage, this._onSocketMessage.bind(this))

    checkPermissions()
      .then(success => success)
      .catch(error => error)
      .then(final => {
        this.refreshDevices()
        if (!final) {
          trigger(SwEvent.Notification, { type: NOTIFICATION_TYPE.userMediaError, error: 'Permission denied' }, this.uuid)
        }
      })
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

  speedTest(bytes: number) {
    return new Promise((resolve, reject) => {
      registerOnce(SwEvent.SpeedTest, speedTestResult => {
        const { upDur, downDur } = speedTestResult
        const upKps = upDur ? (( (bytes * 8) / (upDur / 1000)) / 1024) : 0
        const downKps = downDur ? (( (bytes * 8) / (downDur / 1000)) / 1024) : 0
        resolve({ upDur, downDur, upKps: upKps.toFixed(0), downKps: downKps.toFixed(0) })
      }, this.uuid)

      bytes = Number(bytes)
      if (!bytes) {
        return reject(`Invalid parameter 'bytes': ${bytes}`)
      }

      this._connection.sendRawText(`#SPU ${bytes}`)
      let loops = bytes / 1024
      if (bytes % 1024) {
        loops++
      }
      const dots = '.'.repeat(1024)
      for (let i = 0; i < loops; i++) {
        this._connection.sendRawText(`#SPB ${dots}`)
      }
      this._connection.sendRawText('#SPE')
    })
  }

  async refreshDevices() {
    this._devices = await getDevices()
      .catch(error => {
        logger.error('Refresh Devices error:', error)
        return {}
      })
    return Object.assign({}, this._devices)
  }

  get videoDevices() {
    return this._devices.videoinput
  }

  get audioInDevices() {
    return this._devices.audioinput
  }

  get audioOutDevices() {
    return this._devices.audiooutput
  }

  async setDefaultRtcDevices(params: IRtcDevicesParams) {
    const { micId, micLabel, camId, camLabel, speakerId, speakerLabel } = params
    if (micId || micLabel) {
      await this.setDefaultMicrophone(micId, micLabel).catch(error => logger.warn(error))
    }
    if (camId || camLabel) {
      await this.setDefaultWebcam(camId, camLabel).catch(error => logger.warn(error))
    }
    if (speakerId || speakerLabel) {
      await this.setDefaultSpeaker(speakerId, speakerLabel).catch(error => logger.warn(error))
    }
    return this.defaultRtcDevices
  }

  get defaultRtcDevices() {
    const {
      _microphone: { id: micId, label: micLabel },
      _webcam: { id: camId, label: camLabel },
      _speaker: { id: speakerId, label: speakerLabel }
    } = this
    return { micId, micLabel, camId, camLabel, speakerId, speakerLabel }
  }

  async setDefaultMicrophone(id: string, label: string) {
    const deviceId = await assureDeviceId(id, label).catch(error => null)
    if (deviceId) {
      this._microphone = { ...this._microphone, label, id: deviceId }
    } else {
      throw `id: '${id}' - label: '${label}' is not a valid microphone!`
    }
  }

  get defaultMicrophone() {
    return Object.assign({}, this._microphone)
  }

  async setDefaultWebcam(id: string, label: string) {
    const deviceId = await assureDeviceId(id, label).catch(error => null)
    if (deviceId) {
      this._webcam = { ...this._webcam, label, id: deviceId }
    } else {
      throw `id: '${id}' - label: '${label}' is not a valid webcam!`
    }
  }

  get defaultWebcam() {
    return Object.assign({}, this._webcam)
  }

  async setDefaultSpeaker(id: string, label: string) {
    const deviceId = await assureDeviceId(id, label).catch(error => null)
    if (deviceId) {
      this._speaker = { ...this._speaker, label, id: deviceId }
    } else {
      throw `id: '${id}' - label: '${label}' is not a valid speaker!`
    }
  }

  get defaultSpeaker() {
    return Object.assign({}, this._speaker)
  }

  set defaultRtcConstraints(constraints: { audio: boolean | MediaTrackConstraints, video: boolean | MediaTrackConstraints }) {
    const { audio = null, video = null } = constraints
    if (audio !== null) {
      this.defaultAudioConstraints = audio
    }
    if (video !== null) {
      this.defaultVideoConstraints = video
    }
  }

  get defaultRtcConstraints() {
    return Object.assign({}, { audio: this.defaultAudioConstraints, video: this.defaultVideoConstraints })
  }

  supportedResolutions() {
    return getResolutions()
  }

  protected abstract _onSocketOpen(): void
  protected abstract _onSocketClose(): void
  protected abstract _onSocketError(error): void
  protected abstract _onSocketMessage(response): void

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
