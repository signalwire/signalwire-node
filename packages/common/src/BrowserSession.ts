import logger from './util/logger'
import BaseSession from './BaseSession'
import BaseCall from './webrtc/BaseCall'
import Call from './webrtc/Call'
import { ICacheDevices, IAudioSettings, IVideoSettings, BroadcastParams, SubscribeParams, CallOptions } from './util/interfaces'
import { registerOnce, trigger } from './services/Handler'
import { SwEvent, SESSION_ID, DeviceType } from './util/constants'
import { State } from './util/constants/call'
import { getDevices, scanResolutions, removeUnsupportedConstraints, checkDeviceIdConstraints, destructSubscribeResponse, getUserMedia } from './webrtc/helpers'
import { findElementByType } from './util/helpers'
import { Unsubscribe, Subscribe, Broadcast } from './messages/Verto'
import { localStorage } from './util/storage/'
import { stopStream } from './util/webrtc'

export default abstract class BrowserSession extends BaseSession {
  public calls: { [callId: string]: BaseCall } = {}

  private _iceServers: RTCIceServer[] = []
  private _localElement: HTMLMediaElement = null
  private _remoteElement: HTMLMediaElement = null
  protected _reconnectDelay: number = 1000

  protected _devices: ICacheDevices = {}
  protected _audioConstraints: boolean | MediaTrackConstraints = true
  protected _videoConstraints: boolean | MediaTrackConstraints = false
  protected _speaker: string = null

  async connect(): Promise<void> {
    await this.refreshDevices()
    this.sessionid = await localStorage.getItem(SESSION_ID)
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
   * Alias for .disconnect()
   * @deprecated
   */
  logout() {
    this.disconnect()
  }

  /**
   * Disconnect all active calls
   */
  async disconnect() {
    Object.keys(this.calls).forEach(k => this.calls[k].setState(State.Purge))
    this.calls = {}

    await super.disconnect()
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

  /**
   * Refresh the device list doing an enumerateDevices
   * @deprecated
   */
  async refreshDevices() {
    logger.warn('This method has been deprecated. Use getDevices() instead.')
    const cache = {};
    ['videoinput', 'audioinput', 'audiooutput'].map((kind: string) => {
      cache[kind] = {}
      Object.defineProperty(cache[kind], 'toArray', {
        value: function () {
          return Object.keys(this).map(k => this[k])
        }
      })
    })
    const devices = await this.getDevices()
    devices.forEach((t: MediaDeviceInfo) => {
      if (cache.hasOwnProperty(t.kind)) {
        cache[t.kind][t.deviceId] = t
      }
    })

    this._devices = cache
    return this.devices
  }

  /**
   * @deprecated
   */
  get devices() {
    return this._devices
  }

  /**
   * Return supported resolution for the given webcam.
   */
  async getDeviceResolutions(deviceId: string) {
    try {
      return await scanResolutions(deviceId)
    } catch (error) {
      throw error
    }
  }

  /**
   * @deprecated
   */
  get videoDevices() {
    logger.warn('This property has been deprecated. Use getVideoDevices() instead.')
    return this._devices.videoinput
  }

  /**
   * @deprecated
   */
  get audioInDevices() {
    logger.warn('This property has been deprecated. Use getAudioInDevices() instead.')
    return this._devices.audioinput
  }

  /**
   * @deprecated
   */
  get audioOutDevices() {
    logger.warn('This property has been deprecated. Use getAudioOutDevices() instead.')
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

  set speaker(deviceId: string) {
    const knownSpeakers = Object.keys(this.audioOutDevices)
    if (knownSpeakers.includes(deviceId)) {
      this._speaker = deviceId
    } else {
      throw new Error(`Unknown device ${deviceId}.`)
    }
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
    eventChannel = eventChannel.filter(channel => channel && !this._existsSubscription(this.relayProtocol, channel))
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
      unauthorized.forEach(channel => this._removeSubscription(this.relayProtocol, channel))
    }
    subscribed.forEach(channel => this._addSubscription(this.relayProtocol, handler, channel))
    return response
  }

  async vertoUnsubscribe({ nodeId, channels: eventChannel = [] }: SubscribeParams) {
    eventChannel = eventChannel.filter(channel => channel && this._existsSubscription(this.relayProtocol, channel))
    if (!eventChannel.length) {
      return
    }
    const msg = new Unsubscribe({ sessid: this.sessionid, eventChannel })
    if (nodeId) {
      msg.targetNodeId = nodeId
    }
    const response = await this.execute(msg)
    const { unsubscribed = [], notSubscribed = [] } = destructSubscribeResponse(response)
    unsubscribed.forEach(channel => this._removeSubscription(this.relayProtocol, channel))
    notSubscribed.forEach(channel => this._removeSubscription(this.relayProtocol, channel))
    return response
  }

  async newCall(options: CallOptions) {
    const { destinationNumber = null } = options
    if (!destinationNumber) {
      throw new TypeError('destinationNumber is required')
    }
    const call = new Call(this, options)
    call.invite()
    return call
  }
}
