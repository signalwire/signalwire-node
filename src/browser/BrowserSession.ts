import logger from '../util/logger'
import BaseSession from '../BaseSession'
import Connection from '../services/Connection'
import Dialog from '../rtc/Dialog'
import { SubscribeParams, BroadcastParams, ICacheDevices, IAudioSettings, IVideoSettings } from '../util/interfaces'
import { trigger, registerOnce } from '../services/Handler'
import { SwEvent, NOTIFICATION_TYPE } from '../util/constants'
import { getDevices, getResolutions, checkPermissions, removeUnsupportedConstraints, checkDeviceIdConstraints } from '../services/RTCService'
import { findElementByType } from '../util/helpers'

export default abstract class BrowserSession extends BaseSession {
  public dialogs: { [dialogId: string]: Dialog } = {}

  private _iceServers: RTCIceServer[] = []
  private _localElement: HTMLMediaElement = null
  private _remoteElement: HTMLMediaElement = null

  protected _connection: Connection = null
  protected _devices: ICacheDevices = {}
  protected _audioConstraints: boolean | MediaTrackConstraints = true
  protected _videoConstraints: boolean | MediaTrackConstraints = false

  abstract validateOptions(): boolean
  abstract async subscribe(params: SubscribeParams): Promise<any>
  abstract async unsubscribe(params: SubscribeParams): Promise<any>
  abstract broadcast(params: BroadcastParams): void

  async connect(): Promise<void> {
    if (this._connection && this._connection.connected) {
      logger.warn('Session already connected')
      return
    } else {
      this.disconnect()
    }

    const permissionPromise = checkPermissions()
    const devicePromise = this.refreshDevices()

    const success = await permissionPromise
    await devicePromise

    this._connection = new Connection(this)

    if (!success) {
      trigger(SwEvent.Notification, { type: NOTIFICATION_TYPE.userMediaError, error: 'Permission denied' }, this.uuid)
    }
  }

  disconnect() {
    super.disconnect()
    this.dialogs = {}
  }

  speedTest(bytes: number) {
    return new Promise((resolve, reject) => {
      registerOnce(SwEvent.SpeedTest, speedTestResult => {
        const { upDur, downDur } = speedTestResult
        const upKps = upDur ? (((bytes * 8) / (upDur / 1000)) / 1024) : 0
        const downKps = downDur ? (((bytes * 8) / (downDur / 1000)) / 1024) : 0
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

  get mediaConstraints() {
    return { audio: this._audioConstraints, video: this._videoConstraints }
  }

  async setAudioSettings(settings: IAudioSettings) {
    const { micId, micLabel, ...constraints } = settings
    removeUnsupportedConstraints(constraints)
    this._audioConstraints = await checkDeviceIdConstraints(micId, micLabel, 'audioinput', constraints)
    return this._audioConstraints
  }

  disableMicrophone() {
    this._audioConstraints = false
  }

  enableMicrophone() {
    this._audioConstraints = true
  }

  async setVideoSettings(settings: IVideoSettings) {
    const { camId, camLabel, ...constraints } = settings
    removeUnsupportedConstraints(constraints)
    this._videoConstraints = await checkDeviceIdConstraints(camId, camLabel, 'videoinput', constraints)
    return this._videoConstraints
  }

  disableWebcam() {
    this._videoConstraints = false
  }

  enableWebcam() {
    this._videoConstraints = true
  }

  supportedResolutions() {
    return getResolutions()
  }

  set iceServers(servers: RTCIceServer[] | boolean) {
    if (typeof servers === 'boolean') {
      this._iceServers = servers ? [{ urls: ['stun:stun.l.google.com:19302'] }] : []
    } else {
      this._iceServers = servers
    }
  }

  get iceServers() {
    return this._iceServers
  }

  set localElement(tag: HTMLMediaElement | string | Function) {
    this._localElement = findElementByType(tag)
  }

  get localElement() {
    return this._localElement
  }

  set remoteElement(tag: HTMLMediaElement | string | Function) {
    this._remoteElement = findElementByType(tag)
  }

  get remoteElement() {
    return this._remoteElement
  }
}
