import BaseSession from './BaseSession'
import Connection from './services/Connection'
import Call from './webrtc/Call'
import { ICacheDevices, IAudioSettings, IVideoSettings, BroadcastParams, SubscribeParams } from './util/interfaces'
import { registerOnce } from './services/Handler'
import { SwEvent, SESSION_ID } from './util/constants'
import { State } from './util/constants/call'
import { getDevices, scanResolutions, removeUnsupportedConstraints, checkDeviceIdConstraints, destructSubscribeResponse, getUserMedia } from './webrtc/helpers'
import { findElementByType } from './util/helpers'
import { Unsubscribe, Subscribe, Broadcast } from './messages/Verto'
import * as Storage from './util/storage/'
import { stopStream } from './util/webrtc'

export default abstract class BrowserSession extends BaseSession {
  public calls: { [callId: string]: Call } = {}

  private _iceServers: RTCIceServer[] = []
  private _localElement: HTMLMediaElement = null
  private _remoteElement: HTMLMediaElement = null

  protected _devices: ICacheDevices = {}
  protected _audioConstraints: boolean | MediaTrackConstraints = true
  protected _videoConstraints: boolean | MediaTrackConstraints = false
  protected _speaker: string = null

  async connect(): Promise<void> {
    super.setup()

    await this.refreshDevices()
    this.sessionid = await Storage.getItem(SESSION_ID)
    this.connection = new Connection(this)
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
   * Refresh the device list doing an enumerateDevices
   */
  async refreshDevices() {
    this._devices = await getDevices()
    return this.devices
  }

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
