import BaseSession from './BaseSession'
import { IAudioSettings, IVideoSettings, BroadcastParams, SubscribeParams } from './util/interfaces'
import { registerOnce, trigger } from './services/Handler'
import { SwEvent, SESSION_ID } from './util/constants'
import { State, DeviceType } from './webrtc/constants'
import { getDevices, scanResolutions, removeUnsupportedConstraints, checkDeviceIdConstraints, getUserMedia, assureDeviceId } from './webrtc/helpers'
import { findElementByType } from './util/helpers'
import BaseMessage from './messages/BaseMessage'
import BaseRequest from './messages/verto/BaseRequest'
import { Execute } from './messages/Blade'
import { Unsubscribe, Subscribe, Broadcast, JSApi } from './messages/Verto'
import { localStorage } from './util/storage/'
import { stopStream } from './util/webrtc'
import WebRTCCall from './webrtc/WebRTCCall'

export default abstract class BrowserSession extends BaseSession {
  public calls: { [callId: string]: WebRTCCall } = {}
  public micId: string
  public micLabel: string
  public camId: string
  public camLabel: string
  public autoRecoverCalls: boolean = true
  public incognito = false

  private _iceServers: RTCIceServer[] = []
  private _localElement: HTMLMediaElement = null
  private _remoteElement: HTMLMediaElement = null

  protected _jwtAuth: boolean = true
  protected _audioConstraints: boolean | MediaTrackConstraints = true
  protected _videoConstraints: boolean | MediaTrackConstraints = false
  protected _speaker: string = null

  get reconnectDelay() {
    return 1000
  }

  async connect(): Promise<void> {
    if (!this.incognito) {
      this.sessionid = await localStorage.getItem(SESSION_ID)
    }
    super.connect()
  }

  /**
   * Check if the browser has the permission to access mic and/or webcam
   */
  async checkPermissions(audio: boolean = true, video: boolean = true): Promise<boolean> {
    try {
      const stream = await getUserMedia({ audio, video })
      stopStream(stream)
      return true
    } catch {
      return false
    }
  }

  /**
   * Purge calls means destroy local streams and remove
   */
  purge() {
    Object.keys(this.calls).forEach(k => this.calls[k].setState(State.Purge))
    this.calls = {}
  }

  /**
   * Disconnect all active calls
   */
  async disconnect() {
    const promises = Object.keys(this.calls).map(k => this.calls[k].hangup())
    await Promise.all(promises)
    this.purge()
    return super.disconnect()
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

  /**
   * Return the device list supported by the browser
   */
  getDevices(): Promise<MediaDeviceInfo[]> {
    return getDevices().catch(error => {
      trigger(SwEvent.MediaError, error, this.uuid)
      return []
    })
  }

  /**
   * Return the device list supported by the browser
   */
  getVideoDevices(): Promise<MediaDeviceInfo[]> {
    return getDevices(DeviceType.Video).catch(error => {
      trigger(SwEvent.MediaError, error, this.uuid)
      return []
    })
  }

  /**
   * Return the device list supported by the browser
   */
  getAudioInDevices(): Promise<MediaDeviceInfo[]> {
    return getDevices(DeviceType.AudioIn).catch(error => {
      trigger(SwEvent.MediaError, error, this.uuid)
      return []
    })
  }

  /**
   * Return the device list supported by the browser
   */
  getAudioOutDevices(): Promise<MediaDeviceInfo[]> {
    return getDevices(DeviceType.AudioOut).catch(error => {
      trigger(SwEvent.MediaError, error, this.uuid)
      return []
    })
  }

  validateDeviceId(id: string, label: string, kind: MediaDeviceInfo['kind']): Promise<string> {
    return assureDeviceId(id, label, kind)
  }

  /**
   * Return supported resolution for the given webcam.
   */
  getDeviceResolutions(deviceId: string) {
    return scanResolutions(deviceId)
  }

  get mediaConstraints() {
    return { audio: this._audioConstraints, video: this._videoConstraints }
  }

  async setAudioSettings(settings: IAudioSettings) {
    const { micId, micLabel, ...constraints } = settings
    removeUnsupportedConstraints(constraints)
    this._audioConstraints = await checkDeviceIdConstraints(micId, micLabel, 'audioinput', constraints)
    this.micId = micId
    this.micLabel = micLabel
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
    this.camId = camId
    this.camLabel = camLabel
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

  set speaker(deviceId: string) {
    this._speaker = deviceId
  }

  get speaker() {
    return this._speaker
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

  vertoBroadcast({ nodeId, channel, data }: BroadcastParams) {
    const msg = new Broadcast({ sessid: this.sessionid, eventChannel: channel, data })
    if (nodeId) {
      msg.targetNodeId = nodeId
    }
    return this.execute(msg)
  }

  async vertoSubscribe({ nodeId, channels }: SubscribeParams) {
    const msg = new Subscribe({ sessid: this.sessionid, eventChannel: channels })
    if (nodeId) {
      msg.targetNodeId = nodeId
    }
    return this.execute(msg)
  }

  vertoUnsubscribe({ nodeId, channels }: SubscribeParams) {
    const msg = new Unsubscribe({ sessid: this.sessionid, eventChannel: channels })
    if (nodeId) {
      msg.targetNodeId = nodeId
    }
    return this.execute(msg)
  }

  _jsApi(params = {}) {
    const msg = new JSApi({ ...params, sessid: this.sessionid })
    return this.execute(msg)
  }

  _wrapInExecute(message: BaseMessage): BaseMessage {
    const params = {
      message: message.request,
      node_id: message.targetNodeId || undefined
    }
    return new Execute({ protocol: this.relayProtocol, method: 'message', params })
  }

  execute(message: BaseMessage) {
    if (message instanceof BaseRequest) {
      message = this._wrapInExecute(message)
    }
    return super.execute(message)
  }

  protected _onSocketCloseOrError(event: any): void {
    this.purge()
    super._onSocketCloseOrError(event)
  }
}
