import BaseSession from './BaseSession'
import { IAudioSettings, IVideoSettings, BroadcastParams, SubscribeParams } from './util/interfaces'
import { registerOnce, trigger } from './services/Handler'
import { SwEvent, SESSION_ID } from './util/constants'
import { State, DeviceType } from './webrtc/constants'
import { removeUnsupportedConstraints, getUserMedia, destructSubscribeResponse, destructConferenceState, mungeLayoutList } from './webrtc/helpers'
import { getDevices, scanResolutions, checkDeviceIdConstraints, assureDeviceId } from './webrtc/deviceHelpers'
import BaseMessage from './messages/BaseMessage'
import BaseRequest from './messages/verto/BaseRequest'
import { Execute } from './messages/Blade'
import { Unsubscribe, Subscribe, Broadcast, JSApi } from './messages/Verto'
import { localStorage } from './util/storage/'
import { stopStream } from './util/webrtc'
import WebRTCCall from './webrtc/WebRTCCall'
import Conference from './webrtc/Conference'

export default abstract class BrowserSession extends BaseSession {
  public calls: { [callId: string]: WebRTCCall } = {}
  public conferences: { [confUuid: string]: Conference } = {}
  public channelToCallIds = new Map<string, string[]>()
  public micId: string
  public micLabel: string
  public camId: string
  public camLabel: string
  public autoRecoverCalls: boolean = true
  public incognito = false

  private _iceServers: RTCIceServer[] = []
  private _localElement: HTMLMediaElement | string | Function = null
  private _remoteElement: HTMLMediaElement | string | Function = null

  protected _jwtAuth: boolean = true
  protected _audioConstraints: boolean | MediaTrackConstraints = true
  protected _videoConstraints: boolean | MediaTrackConstraints = false
  protected _speaker: string = null

  get callIds() {
    return Object.keys(this.calls)
  }

  addChannelCallIdEntry(channel: string, callId: string) {
    const current = this.channelToCallIds.get(channel) || []
    current.push(callId)
    this.channelToCallIds.set(channel, current)
  }

  removeChannelCallIdEntry(channel: string, callId: string) {
    const current = this.channelToCallIds.get(channel) || []
    const filtered = current.filter(id => id !== callId)
    this.channelToCallIds.set(channel, filtered)
  }

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
   * @deprecated Directly exported from the SDK entrypoint
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
   * @deprecated Directly exported from the SDK entrypoint
   */
  getDevices(): Promise<MediaDeviceInfo[]> {
    return getDevices().catch(error => {
      trigger(SwEvent.MediaError, error, this.uuid)
      return []
    })
  }

  /**
   * Return the device list supported by the browser
   * @deprecated Directly exported from the SDK entrypoint
   */
  getVideoDevices(): Promise<MediaDeviceInfo[]> {
    return getDevices(DeviceType.Video).catch(error => {
      trigger(SwEvent.MediaError, error, this.uuid)
      return []
    })
  }

  /**
   * Return the device list supported by the browser
   * @deprecated Directly exported from the SDK entrypoint
   */
  getAudioInDevices(): Promise<MediaDeviceInfo[]> {
    return getDevices(DeviceType.AudioIn).catch(error => {
      trigger(SwEvent.MediaError, error, this.uuid)
      return []
    })
  }

  /**
   * Return the device list supported by the browser
   * @deprecated Directly exported from the SDK entrypoint
   */
  getAudioOutDevices(): Promise<MediaDeviceInfo[]> {
    return getDevices(DeviceType.AudioOut).catch(error => {
      trigger(SwEvent.MediaError, error, this.uuid)
      return []
    })
  }

  /**
   * Validate if a device is available
   * @deprecated Directly exported from the SDK entrypoint
   */
  validateDeviceId(id: string, label: string, kind: MediaDeviceInfo['kind']): Promise<string> {
    return assureDeviceId(id, label, kind)
  }

  /**
   * @deprecated Directly exported from the SDK entrypoint
   */
  validateVideoDevice(id: string, label: string): Promise<string> {
    return assureDeviceId(id, label, 'videoinput')
  }

  /**
   * @deprecated Directly exported from the SDK entrypoint
   */
  validateAudioInDevice(id: string, label: string): Promise<string> {
    return assureDeviceId(id, label, 'audioinput')
  }

  /**
   * @deprecated Directly exported from the SDK entrypoint
   */
  validateAudioOutDevice(id: string, label: string): Promise<string> {
    return assureDeviceId(id, label, 'audiooutput')
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
    this.micId = null
    this.micLabel = null
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
    this.camId = null
    this.camLabel = null
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
    this._localElement = tag
  }

  get localElement() {
    return this._localElement
  }

  set remoteElement(tag: HTMLMediaElement | string | Function) {
    this._remoteElement = tag
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

  async vertoSubscribe({ nodeId, channels, handler = null }: SubscribeParams) {
    const msg = new Subscribe({ sessid: this.sessionid, eventChannel: channels })
    if (nodeId) {
      msg.targetNodeId = nodeId
    }
    try {
      const response = await this.execute(msg)
      if (handler) {
        const { subscribed = [] } = destructSubscribeResponse(response)
        subscribed.forEach(channel => this._addSubscription(this.relayProtocol, handler, channel))
      }
      return response
    } catch (error) {
      throw error
    }
  }

  async vertoUnsubscribe({ nodeId, channels, handler = null }: SubscribeParams) {
    const msg = new Unsubscribe({ sessid: this.sessionid, eventChannel: channels })
    if (nodeId) {
      msg.targetNodeId = nodeId
    }
    try {
      const response = await this.execute(msg)
      if (handler) {
        const { unsubscribed = [], notSubscribed = [] } = destructSubscribeResponse(response)
        unsubscribed.forEach(channel => this._removeSubscription(this.relayProtocol, channel))
        notSubscribed.forEach(channel => this._removeSubscription(this.relayProtocol, channel))
      }
      return response
    } catch (error) {
      throw error
    }
  }

  listConf() {
    const msg = new Execute({
      protocol: this.relayProtocol,
      method: 'conference.list',
      params: {}
    })
    console.debug('Send confList', msg)
    return this.execute(msg)
  }

  async vertoConferenceList(showLayouts = false, showMembers = false) {
    try {
      const rooms = []
      const response = await this._jsApi({
        command: 'conference',
        data: {
          command: 'list',
          showLayouts,
          showMembers,
        },
      })
      response.conferences.forEach((conf) => {
        const { conferenceState, members = [], layouts = [] } = conf
        const room = destructConferenceState(conferenceState)
        if (members.length) {
          room.members = members.filter(({ type }) => type === 'caller')
            .map(({ id, uuid, caller_id_number, caller_id_name }) => {
              return {
                participantId: Number(id).toString(),
                callId: uuid,
                participantNumber: caller_id_number,
                participantName: caller_id_name,
              }
            })
        }
        if (layouts.length) {
          const normal = layouts.filter(({ type }) => type === 'layout')
          const group = layouts.filter(({ type }) => type === 'layoutGroup')
          room.layouts = mungeLayoutList(normal, group)
        }
        rooms.push(room)
      })

      return rooms
    } catch (error) {
      console.error('vertoConferenceList error', error)
      return []
    }
  }

  async vertoLayoutList(options: { fullList?: boolean } = {}) {
    const { fullList = false } = options
    try {
      const {
        layouts: { layouts, groups }
      } = await this._jsApi({
        command: 'conference',
        data: {
          command: 'listLayouts',
        },
      })
      const final = mungeLayoutList(layouts, groups)
        .map((layout) => {
          const { id, type } = layout
          const prefix = type === 'group' ? 'group:' : ''
          return {
            ...layout,
            id: `${prefix}${id}`,
          }
        })
      if (fullList) {
        return final
      }
      return final.filter(layout => !layout.belongsToAGroup)
    } catch (error) {
      console.error('vertoLayoutList error', error)
      return []
    }
  }

  watchVertoConferences = async () => {

  }

  unwatchVertoConferences = async () => {

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
