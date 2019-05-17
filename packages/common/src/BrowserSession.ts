import BaseSession from './BaseSession'
import Connection from './services/Connection'
import Dialog from './webrtc/Dialog'
import { ICacheDevices, IAudioSettings, IVideoSettings, BroadcastParams, SubscribeParams, ICacheResolution } from './util/interfaces'
import { trigger, registerOnce } from './services/Handler'
import { SwEvent, NOTIFICATION_TYPE } from './util/constants'
import { State } from './util/constants/dialog'
import { getDevices, getResolutions, checkPermissions, removeUnsupportedConstraints, checkDeviceIdConstraints, destructSubscribeResponse } from './webrtc/helpers'
import { findElementByType } from './util/helpers'
import { Unsubscribe, Subscribe, Broadcast } from './messages/Verto'

export default abstract class BrowserSession extends BaseSession {
  public dialogs: { [dialogId: string]: Dialog } = {}

  private _iceServers: RTCIceServer[] = []
  private _localElement: HTMLMediaElement = null
  private _remoteElement: HTMLMediaElement = null

  protected _devices: ICacheDevices = {}
  protected _audioConstraints: boolean | MediaTrackConstraints = true
  protected _videoConstraints: boolean | MediaTrackConstraints = false
  protected _resolutions: ICacheResolution[]

  /**
   * Override: webrtc client needs domain and resource
   * @return boolean
   */
  validateOptions() {
    const { host, project, token, domain, resource } = this.options
    return Boolean(host) && Boolean(project && token && domain && resource)
  }

  async connect(): Promise<void> {
    super.setup()

    const success = await checkPermissions()
    if (success) {
      this.refreshResolutions()
    } else {
      trigger(SwEvent.Notification, { type: NOTIFICATION_TYPE.userMediaError, error: 'Permission denied' }, this.uuid)
    }
    await this.refreshDevices()

    this.connection = new Connection(this)
  }

  /**
   * Alias for .disconnect()
   * @deprecated
   */
  logout() {
    this.disconnect()
  }

  /**
   * Purge all active dialogs
   * @return void
   */
  purge() {
    Object.keys(this.dialogs).forEach(k => this.dialogs[k].setState(State.Purge))
    this.dialogs = {}

    super.purge()
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

      this.executeRaw(`#SPU ${bytes}`)
      let loops = bytes / 1024
      if (bytes % 1024) {
        loops++
      }
      const dots = '.'.repeat(1024)
      for (let i = 0; i < loops; i++) {
        this.executeRaw(`#SPB ${dots}`)
      }
      this.executeRaw('#SPE')
    })
  }

  async refreshDevices() {
    this._devices = await getDevices()
    return this.devices
  }

  get devices() {
    return this._devices
  }

  async refreshResolutions() {
    this._resolutions = await getResolutions()
    return this.resolutions
  }

  get resolutions() {
    return this._resolutions
  }

  /** Backwards compatibility */
  supportedResolutions() {
    return Promise.resolve(this.resolutions)
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

  abstract get webRtcProtocol(): string

  vertoBroadcast({ nodeId, channel: eventChannel = '', data }: BroadcastParams) {
    if (!eventChannel) {
      throw new Error('Invalid channel for broadcast: ' + eventChannel)
    }
    const msg = new Broadcast({ sessid: this.sessionid, eventChannel, data })
    if (nodeId) {
      msg.targetNodeId = nodeId
    }
    this.execute(msg).catch(error => error)
  }

  async vertoSubscribe({ nodeId, channels: eventChannel = [], handler }: SubscribeParams) {
    eventChannel = eventChannel.filter(channel => channel && !this._existsSubscription(this.webRtcProtocol, channel))
    if (!eventChannel.length) {
      return
    }
    const msg = new Subscribe({ sessid: this.sessionid, eventChannel })
    if (nodeId) {
      msg.targetNodeId = nodeId
    }
    const response = await this.execute(msg)
    const { unauthorized = [], subscribed = [] } = destructSubscribeResponse(response)
    if (unauthorized.length) {
      unauthorized.forEach(channel => this._removeSubscription(this.webRtcProtocol, channel))
    }
    subscribed.forEach(channel => this._addSubscription(this.webRtcProtocol, handler, channel))
    return response
  }

  async vertoUnsubscribe({ nodeId, channels: eventChannel = [] }: SubscribeParams) {
    eventChannel = eventChannel.filter(channel => channel && this._existsSubscription(this.webRtcProtocol, channel))
    if (!eventChannel.length) {
      return
    }
    const msg = new Unsubscribe({ sessid: this.sessionid, eventChannel })
    if (nodeId) {
      msg.targetNodeId = nodeId
    }
    const response = await this.execute(msg)
    const { unsubscribed = [], notSubscribed = [] } = destructSubscribeResponse(response)
    unsubscribed.forEach(channel => this._removeSubscription(this.webRtcProtocol, channel))
    notSubscribed.forEach(channel => this._removeSubscription(this.webRtcProtocol, channel))
    return response
  }
}
