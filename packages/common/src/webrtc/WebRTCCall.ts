import { v4 as uuidv4 } from 'uuid'
import logger from '../util/logger'
import BrowserSession from '../BrowserSession'
import BaseMessage from '../messages/BaseMessage'
import RTCPeer from './RTCPeer'
import { Bye, Info, Modify } from '../messages/Verto'
import { SwEvent, VERTO_PROTOCOL } from '../util/constants'
import { State, DEFAULT_CALL_OPTIONS, PeerType, VertoMethod, Notification, Direction, ConferenceAction, RTCErrorCode } from './constants'
import { trigger, register, deRegisterAll, deRegister } from '../services/Handler'
import { enableAudioTracks, disableAudioTracks, toggleAudioTracks, enableVideoTracks, disableVideoTracks, toggleVideoTracks, checkIsDirectCall, mutateCanvasInfoData, destructSubscribeResponse } from './helpers'
import { objEmpty, isFunction } from '../util/helpers'
import { CallOptions, IHangupParams, ICallParticipant, VertoPvtData, ICanvasInfo } from './interfaces'
import { stopStream, stopTrack, setMediaElementSinkId, getUserMedia, getHostname } from '../util/webrtc'
import laChannelHandler, { publicLiveArrayMethods } from './LaChannelHandler'
import chatChannelHandler, { publicChatMethods } from './ChatChannelHandler'
import modChannelHandler, { publicModMethods } from './ModChannelHandler'
import infoChannelHandler, { publicInfoMethods } from './InfoChannelHandler'
import { destructConferenceState } from './helpers'

export default abstract class WebRTCCall {
  public id: string = ''
  public nodeId: string
  public direction: Direction
  public peer: RTCPeer
  public options: CallOptions
  public cause: string
  public causeCode: string
  public hangupError: Error
  public gotEarly = false
  public screenShare?: WebRTCCall
  public secondSource?: WebRTCCall
  public doReinvite = false
  public isDirect = false
  public videoElements: HTMLVideoElement[] = []
  public audioElements: HTMLAudioElement[] = []
  public pvtData: VertoPvtData = null
  public canvasType: string
  public canvasInfo: ICanvasInfo
  public participantLayerIndex = -1
  public participantLogo = ''
  private _extension: string = null
  private _state: State = State.New
  private _prevState: State = State.New
  private _laChannelAudioMuted: boolean = null
  private _laChannelVideoMuted: boolean = null

  startScreenShare?(opts?: CallOptions): Promise<WebRTCCall>
  stopScreenShare?(): void
  addSecondSource?(opts?: CallOptions): Promise<WebRTCCall>
  removeSecondSource?(): void
  setAudioOutDevice?(deviceId: string): Promise<boolean>
  switchCamera?(): void
  setSpeakerPhone?(flag: boolean): void

  sendChatMessage?(message: string, type: string): void
  getLayoutInfo?(): void
  getConferenceState?(): void
  liveArrayBootstrap?(): void
  modCommand?(command: string, id: string, value: any): void
  listVideoLayouts?(): void
  playMedia?(file: string): void
  stopMedia?(): void
  pauseMedia?(isAsync?: boolean): void
  fileSeek?(value: string, isAsync?: boolean): void
  fileVolume?(value: string, isAsync?: boolean): void
  startRecord?(file: string): void
  stopRecord?(): void
  snapshot?(file: string): void
  lock?(): void
  unlock?(): void
  setVideoLayout?(layout: string, canvasID: number): void
  kick?(id: string): void
  muteAudioAll?(flags?: string): void
  unmuteAudioAll?(): void
  muteVideoAll?(): void
  unmuteVideoAll?(): void
  setReservationId?(participantId: string, value?: string): void
  videoFloor?(participantId: string): void
  banner?(participantId: string, text: string): void
  volumeDown?(participantId: string): void
  volumeUp?(participantId: string): void
  gainDown?(participantId: string): void
  gainUp?(participantId: string): void
  setEnergy?(participantId: string, value: string): void
  transferMember?(participantId: string, destination: string): void
  setDenoise?(participantId: string, value?: string): void
  setLowBitrate?(participantId: string, value?: string): void
  addToCall?(extension: string, email?: string, name?: string): void
  setHandRaised?(participantId: string, value?: string): void
  confQuality?(value: string): void
  confFullscreen?(participantId: string, value: string): void
  sayAll?(value: string): void
  sayMember?(participantId: string, value: string): void
  setBanner?(participantId: string, value: string): void
  setPerformerDelay?(value: string): void
  setVolumeAudience?(value: string): void
  toggleVidMuteHide?(value?: string): void
  setMeetingMode?(value?: string): void
  setSilentMode?(value?: string): void
  setConfVariable?(variable: string, value: string): void
  grantModerator?(participantId: string, value: string): void
  grantScreenShare?(participantId: string, value: string): void
  setPin?(pin: string): void
  removePin?(): void
  setModeratorPin?(pin: string): void
  removeModeratorPin?(): void
  setConfLayoutMode?(value: string): void

  constructor(public session: BrowserSession, opts?: CallOptions) {
    const { iceServers, speaker: speakerId, micId, micLabel, camId, camLabel, localElement, remoteElement, mediaConstraints: { audio, video } } = session
    this.options = Object.assign({}, DEFAULT_CALL_OPTIONS, { audio, video, iceServers, localElement, remoteElement, micId, micLabel, camId, camLabel, speakerId }, opts)

    this._onMediaError = this._onMediaError.bind(this)
    this._onVertoAnswer = this._onVertoAnswer.bind(this)
    this._onVertoAttach = this._onVertoAttach.bind(this)
    this._onVertoMedia = this._onVertoMedia.bind(this)
    this._onVertoMediaParams = this._onVertoMediaParams.bind(this)
    this._onVertoPrompt = this._onVertoPrompt.bind(this)
    this._hangup = this._hangup.bind(this)
    this._onParticipantData = this._onParticipantData.bind(this)
    this._onGenericEvent = this._onGenericEvent.bind(this)

    this._init()
  }

  get state() {
    return State[this._state].toLowerCase()
  }

  get active() {
    return this._state === State.Active
  }

  get trying() {
    return this._state === State.Trying
  }

  get extension() {
    return this._extension || this.options.destinationNumber
  }

  set extension(extension: string) {
    this._extension = extension
  }

  get prevState() {
    return State[this._prevState].toLowerCase()
  }

  get localStream() {
    return this.options.localStream
  }

  get remoteStream() {
    return this.options.remoteStream
  }

  get messagePayload() {
    if (this.session.relayProtocol === VERTO_PROTOCOL) {
      return { sessid: this.session.sessionid, dialogParams: this.options }
    }
    // FIXME: Send only the fields relay accepts
    const { id, destinationNumber, attach, callerName, callerNumber, remoteCallerName, remoteCallerNumber, userVariables, screenShare } = this.options
    return {
      sessid: this.session.sessionid,
      dialogParams: {
        id, destinationNumber, attach, callerName, callerNumber, remoteCallerName, remoteCallerNumber, userVariables, screenShare,
      }
    }
  }

  get currentParticipant(): Partial<ICallParticipant> {
    const participant = {
      id: this.participantId,
      role: this.participantRole,
      layer: null,
      layerIndex: this.participantLayerIndex,
      isLayerBehind: false,
    }
    if (this.canvasInfo && this.participantLayerIndex >= 0) {
      const { layoutOverlap, canvasLayouts } = this.canvasInfo
      participant.layer = canvasLayouts[this.participantLayerIndex] || null
      participant.isLayerBehind = layoutOverlap && participant.layer && participant.layer.overlap === 0
    }
    return participant
  }

  get participantId() {
    return this.pvtData ? String(this.pvtData.conferenceMemberID) : null
  }

  get participantRole() {
    return this.pvtData ? this.pvtData.role : null
  }

  get role() {
    return this.participantRole
  }

  get cameraId() {
    return this.peer ? this.peer.getDeviceId('video') : null
  }

  get cameraLabel() {
    return this.peer ? this.peer.getDeviceLabel('video') : null
  }

  get microphoneId() {
    return this.peer ? this.peer.getDeviceId('audio') : null
  }

  get microphoneLabel() {
    return this.peer ? this.peer.getDeviceLabel('audio') : null
  }

  get withAudio() {
    return this.remoteStream ? this.remoteStream.getAudioTracks().length > 0 : false
  }

  get withVideo() {
    return this.remoteStream ? this.remoteStream.getVideoTracks().length > 0 : false
  }

  get htmlVideoElement() {
    return this.videoElements.length ? this.videoElements[0] : null
  }

  get htmlAudioElement() {
    return this.audioElements.length ? this.audioElements[0] : null
  }

  get conferenceChannels() {
    if (!this.pvtData) {
      return []
    }
    const { laChannel, chatChannel, infoChannel, modChannel } = this.pvtData
    return [laChannel, chatChannel, infoChannel, modChannel].filter(Boolean)
  }

  get conferenceName() {
    if (this.pvtData) {
      const { conferenceDisplayName, conferenceName } = this.pvtData
      return conferenceDisplayName || conferenceName
    }
    return null
  }

  get conferenceMd5() {
    return this.pvtData ? this.pvtData.conferenceMD5 : null
  }

  get conferenceUuid() {
    if (this.pvtData) {
      /**
       * If conferenceDisplayName is present conferenceName is the UUID to use
       * Otherwise just conferenceUUID
       */
      const { conferenceDisplayName, conferenceName, conferenceUUID } = this.pvtData
      return conferenceDisplayName ? conferenceName : conferenceUUID
    }
    return null
  }

  async _upgrade() {
    logger.warn(`Untested upgrade method!`)
    // FIXME: Hack to prevent endless loop on modify vs attach
    this.doReinvite = true
    // TODO: force peer.type to an Offer
    this.peer.type = PeerType.Offer

    const stream = await getUserMedia({ video: true })
    stream.getTracks().forEach(t => {
      this.options.localStream.addTrack(t)
      this.peer.instance.addTrack(t, this.options.localStream)
    })
  }

  async updateDevices(constraints: MediaStreamConstraints): Promise<void> {
    try {
      logger.trace('updateDevices trying constraints', this.id, constraints)
      if (!Object.keys(constraints).length) {
        return console.warn('Invalid constraints:', constraints)
      }
      const newStream = await getUserMedia(constraints)
      logger.trace('updateDevices got stream', newStream)
      if (!this.options.localStream) {
        this.options.localStream = new MediaStream()
      }
      const { instance } = this.peer
      const tracks = newStream.getTracks()
      for (let i = 0; i < tracks.length; i++) {
        const newTrack = tracks[i]
        logger.trace('updateDevices apply track: ', newTrack)
        const transceiver = instance.getTransceivers().find(({ mid, sender, receiver }) => {
          if (sender.track && sender.track.kind === newTrack.kind) {
            logger.trace('Found transceiver by sender')
            return true
          }
          if (receiver.track && receiver.track.kind === newTrack.kind) {
            logger.trace('Found transceiver by receiver')
            return true
          }
          if (mid === null) {
            logger.trace('Found disassociated transceiver')
            return true
          }
          return false
        })
        if (transceiver && transceiver.sender) {
          logger.trace('updateDevices FOUND - replaceTrack on it and on localStream')
          await transceiver.sender.replaceTrack(newTrack)
          this.options.localStream.addTrack(newTrack)
          logger.trace('updateDevices replaceTrack SUCCESS')
          this.options.localStream.getTracks().forEach(track => {
            if (track.kind === newTrack.kind && track.id !== newTrack.id) {
              logger.trace('updateDevices stop old track and apply new one - ')
              stopTrack(track)
              this.options.localStream.removeTrack(track)
            }
          })
        } else {
          logger.trace('updateDevices NOT FOUND - addTrack and start dancing!')
          this.peer.type = PeerType.Offer
          this.doReinvite = true
          this.options.localStream.addTrack(newTrack)
          instance.addTrack(newTrack, this.options.localStream)
        }
        logger.trace('updateDevices Simply update mic/cam')
        if (newTrack.kind === 'audio') {
          this.options.micId = newTrack.getSettings().deviceId
        } else if (newTrack.kind === 'video') {
          this.options.camId = newTrack.getSettings().deviceId
        }
      }
      logger.trace('updateDevices done!')
      this._dispatchNotification({ type: Notification.DeviceUpdated })
    } catch (error) {
      console.error('updateDevices', error)
      throw error
    }
  }

  invite() {
    return new Promise(async (resolve, reject) => {
      this.direction = Direction.Outbound
      this.peer = new RTCPeer(this, PeerType.Offer, this.options)
      try {
        await this.peer.start()

        resolve(this)
      } catch (error) {
        logger.error(`Invite failed ${this.id}`, error)
        reject(error)
      }
    })
  }

  answer() {
    return new Promise(async (resolve, reject) => {
      this.direction = Direction.Inbound
      this.peer = new RTCPeer(this, PeerType.Answer, this.options)
      try {
        await this.peer.start()

        resolve(this)
      } catch (error) {
        logger.error(`Answer failed ${this.id}`, error)
        reject(error)
      }
    })
  }

  async hangup(params?: IHangupParams) {
    const states = [State.Hangup, State.Destroy]
    if (states.includes(this._state)) {
      logger.info(`Call ${this.id} already in ${this.state} state.`)
      return
    }

    try {
      const bye = new Bye(this.messagePayload)
      await this._execute(bye)
    } catch (error) {
      logger.error('Hangup error:', error)
    } finally {
      this._hangup(params)
    }
  }

  dtmf(dtmf: string) {
    const msg = new Info({ ...this.messagePayload, dtmf })
    this._execute(msg)
  }

  sendCurrentMediaSettings() {
    const params = {
      type: 'mediaSettings',
      audioinput: this.peer.getTrackSettings('audio'),
      videoinput: this.peer.getTrackSettings('video'),
      audiooutput: {
        deviceId: this.options.speakerId
      },
    }
    return this._sendVertoInfo(params)
  }

  private _sendVertoInfo(params: object) {
    const msg = new Info({ ...this.messagePayload, ...params })
    return this._execute(msg)
  }

  transfer(destination: string) {
    const msg = new Modify({ ...this.messagePayload, action: 'transfer', destination })
    this._execute(msg)
  }

  replace(callId: string) {
    const msg = new Modify({ ...this.messagePayload, action: 'replace', replaceCallID: callId })
    this._execute(msg)
  }

  askVideoKeyFrame() {
    const msg = new Modify({ ...this.messagePayload, action: 'videoRefresh' })
    return this._execute(msg)
  }

  hold() {
    return this._changeHold('hold')
  }

  unhold() {
    return this._changeHold('unhold')
  }

  toggleHold() {
    return this._changeHold('toggleHold')
  }

  disableOutboundAudio() {
    disableAudioTracks(this.options.localStream)
  }

  enableOutboundAudio() {
    enableAudioTracks(this.options.localStream)
  }

  toggleOutboundAudio() {
    toggleAudioTracks(this.options.localStream)
  }

  disableOutboundVideo() {
    disableVideoTracks(this.options.localStream)
  }

  enableOutboundVideo() {
    enableVideoTracks(this.options.localStream)
  }

  toggleOutboundVideo() {
    toggleVideoTracks(this.options.localStream)
  }

  muteAudio(participantId?: string): void
  muteAudio() {
    disableAudioTracks(this.options.localStream)
  }

  unmuteAudio(participantId?: string): void
  unmuteAudio() {
    enableAudioTracks(this.options.localStream)
  }

  toggleAudioMute(participantId?: string): void
  toggleAudioMute() {
    toggleAudioTracks(this.options.localStream)
  }

  muteVideo(participantId?: string): void
  muteVideo() {
    disableVideoTracks(this.options.localStream)
  }

  unmuteVideo(participantId?: string): void
  unmuteVideo() {
    enableVideoTracks(this.options.localStream)
  }

  toggleVideoMute(participantId?: string): void
  toggleVideoMute() {
    toggleVideoTracks(this.options.localStream)
  }

  deaf(participantId?: string): void
  deaf() {
    disableAudioTracks(this.options.remoteStream)
  }

  undeaf(participantId?: string): void
  undeaf() {
    enableAudioTracks(this.options.remoteStream)
  }

  toggleDeaf(participantId?: string): void
  toggleDeaf() {
    toggleAudioTracks(this.options.remoteStream)
  }

  // sfuLowResolution(streamId: string, trackId: string) {
  //   console.debug('Set video res to low')
  //   const msg = new Modify({ ...this.messagePayload, action: 'set-sfu-low-res', streamId, trackId })
  //   return this._execute(msg)
  // }

  // sfuHighResolution(streamId: string, trackId: string) {
  //   console.debug('Set video res to high')
  //   const msg = new Modify({ ...this.messagePayload, action: 'set-sfu-high-res', streamId, trackId })
  //   return this._execute(msg)
  // }

  // sfuDefaultResolution(streamId: string, trackId: string) {
  //   console.debug('Set video res to default')
  //   const msg = new Modify({ ...this.messagePayload, action: 'set-sfu-default-res', streamId, trackId })
  //   return this._execute(msg)
  // }

  doReinviteWithRelayOnly() {
    if (this.peer && this.active) {
      this.peer.restartIceWithRelayOnly()
    }
  }

  stopOutboundAudio() {
    if (this.peer && this.active) {
      this.peer.stopTrackSender('audio')
    }
  }

  restoreOutboundAudio() {
    if (this.peer && this.active) {
      this.peer.restoreTrackSender('audio')
    }
  }

  stopOutboundVideo() {
    if (this.peer && this.active) {
      this.peer.stopTrackSender('video')
    }
  }

  restoreOutboundVideo() {
    if (this.peer && this.active) {
      this.peer.restoreTrackSender('video')
    }
  }

  setState(state: State) {
    this._prevState = this._state
    this._state = state
    logger.info(`Call ${this.id} state change from ${this.prevState} to ${this.state}`)

    this._dispatchNotification({ type: Notification.CallUpdate })

    switch (state) {
      case State.Purge:
        if (this.screenShare instanceof WebRTCCall) {
          this.screenShare.setState(State.Purge)
        }
        if (this.secondSource instanceof WebRTCCall) {
          this.secondSource.setState(State.Purge)
        }
        this._finalize()
        break
      case State.Active: {
        setTimeout(() => {
          const { remoteElement, speakerId } = this.options
          setMediaElementSinkId(remoteElement, speakerId)
        }, 0)
        break
      }
      case State.Hangup:
        if (this.screenShare instanceof WebRTCCall) {
          this.screenShare.hangup()
        }
        if (this.secondSource instanceof WebRTCCall) {
          this.secondSource.hangup()
        }
        this.setState(State.Destroy)
        break
      case State.Destroy:
        this._finalize()
        break
    }
  }

  async conferencePartHandler(pvtData: VertoPvtData) {
    this.pvtData = pvtData
    const notification = {
      action: ConferenceAction.Leave,
      conferenceName: this.conferenceName,
      conferenceMd5: this.conferenceMd5,
      conferenceUuid: this.conferenceUuid,
      participantId: this.participantId,
      role: this.participantRole,
    }
    this._dispatchConferenceUpdate(notification)
    this._removeConferenceChannels()
  }

  async conferenceJoinHandler(pvtData: VertoPvtData) {
    this.pvtData = pvtData
    this.extension = pvtData.conferenceDisplayName || pvtData.laName

    const laObject = {
      session: this.session,
      nodeId: this.nodeId,
      channel: this.pvtData.laChannel || null,
      laName: this.pvtData.laName || null,
    }
    Object.keys(publicLiveArrayMethods).forEach(method => {
      Object.defineProperty(this, method, {
        configurable: true,
        writable: true,
        value: publicLiveArrayMethods[method].bind(laObject)
      })
    })

    const chatObject = {
      session: this.session,
      nodeId: this.nodeId,
      channel: this.pvtData.chatChannel || null,
    }
    Object.keys(publicChatMethods).forEach(method => {
      Object.defineProperty(this, method, {
        configurable: true,
        writable: true,
        value: publicChatMethods[method].bind(chatObject)
      })
    })

    const modObject = {
      session: this.session,
      nodeId: this.nodeId,
      channel: this.pvtData.modChannel || null,
      callID: this.id,
    }
    Object.keys(publicModMethods).forEach(method => {
      Object.defineProperty(this, method, {
        configurable: true,
        writable: true,
        value: publicModMethods[method].bind(modObject)
      })
    })

    const infoObject = {
      session: this.session,
      nodeId: this.nodeId,
      channel: this.pvtData.infoChannel || null,
      callID: this.id,
    }
    Object.keys(publicInfoMethods).forEach(method => {
      Object.defineProperty(this, method, {
        configurable: true,
        writable: true,
        value: publicInfoMethods[method].bind(infoObject)
      })
    })

    try {
      const { relayProtocol } = this.session
      this.conferenceChannels.forEach(channel => {
        deRegister(relayProtocol, null, channel)
        this.session.addChannelCallIdEntry(channel, this.id)
      })
      const filteredChannels = this.conferenceChannels.filter(channel => {
        const global = channel.split('.')[0]
        return !this.session._existsSubscription(relayProtocol, global)
      })
      const result = await this.session.vertoSubscribe({
        nodeId: pvtData.nodeId,
        channels: filteredChannels,
      })
      const { subscribed = [], alreadySubscribed = [] } = destructSubscribeResponse(result)
      const all = subscribed.concat(alreadySubscribed)
      const { laChannel, chatChannel, infoChannel, modChannel } = this.pvtData
      if (all.includes(laChannel)) {
        deRegister(relayProtocol, null, laChannel)
        register(relayProtocol, laChannelHandler.bind(this, this.session), laChannel)
      }
      if (all.includes(chatChannel)) {
        deRegister(relayProtocol, null, chatChannel)
        register(relayProtocol, chatChannelHandler.bind(this, this.session), chatChannel)
      }
      if (all.includes(infoChannel)) {
        deRegister(relayProtocol, null, infoChannel)
        register(relayProtocol, infoChannelHandler.bind(this, this.session), infoChannel)
      }
      if (all.includes(modChannel)) {
        deRegister(relayProtocol, null, modChannel)
        register(relayProtocol, modChannelHandler.bind(this, this.session), modChannel)
      }

      const notification = {
        action: ConferenceAction.Join,
        conferenceName: this.conferenceName,
        conferenceMd5: this.conferenceMd5,
        conferenceUuid: this.conferenceUuid,
        participantId: this.participantId,
        role: this.participantRole,
      }
      this._dispatchConferenceUpdate(notification)


      /**
       * After dispatch the Join notification, bootstrap the room data.
       * - liveArray bootstrap
       * - layout bootstrap
       * - ask for conferenceState
       */
      if (all.includes(laChannel)) {
        this.liveArrayBootstrap()
      }
      if (all.includes(infoChannel)) {
        this.getLayoutInfo()
        this.getConferenceState()
      }

    } catch (error) {
      logger.error('Conference subscriptions error:', error)
    }
  }

  updateLayouts(params: any) {
    const { contentType, callID, canvasType, canvasInfo = null, currentLayerIdx = null, ...rest } = params
    this.canvasType = canvasType
    if (contentType === 'layer-info' && currentLayerIdx !== null) {
      this.participantLayerIndex = currentLayerIdx
    }
    if (canvasInfo !== null) {
      this.canvasInfo = mutateCanvasInfoData(canvasInfo)
    }
    const action = contentType === 'layer-info' ? ConferenceAction.LayerInfo : ConferenceAction.LayoutInfo
    this._dispatchConferenceUpdate({ action, participant: this.currentParticipant, canvasInfo: this.canvasInfo, contentType, canvasType, ...rest })
  }

  updateLogo(params: any) {
    const { logoURL: logo } = params
    this.participantLogo = logo
    this._dispatchConferenceUpdate({ action: ConferenceAction.LogoInfo, logo })
  }

  handleCaptionInfo(params: any) {
    const { contentType, ...rest } = params
    this._dispatchConferenceUpdate({ action: ConferenceAction.CaptionInfo, ...rest })
  }

  handleConferenceInfo(params: any) {
    const { conferenceState, messages = [] } = params
    this._dispatchConferenceUpdate({ action: ConferenceAction.ConferenceInfo, conferenceState: destructConferenceState(conferenceState), messages })
  }

  handleMemberMsState(params: any) {
    this._dispatchConferenceUpdate({ action: ConferenceAction.MemberMsState, ...params })
  }

  updateFromLaChannel(muted: boolean, vmuted: boolean) {
    this._laChannelAudioMuted = muted
    if (this._laChannelVideoMuted !== vmuted) {
      vmuted ? this.stopOutboundVideo() : this.restoreOutboundVideo()
    }
    this._laChannelVideoMuted = vmuted
  }

  async resume() {
    logger.debug(`[resume] Call ${this.id}`)
    if (this.peer?.instance) {
      const { connectionState } = this.peer.instance
      logger.debug(`[resume] connectionState for ${this.id} is '${connectionState}'`)
      if (connectionState === 'failed') {
        this.peer.restartIce()
      }
    }

    if (this.pvtData) {
      logger.debug('[resume] Bootstrap data from verto channels', this.pvtData)
      await this.conferenceJoinHandler(this.pvtData)
    }
  }

  private _removeConferenceChannels() {
    if (!this.conferenceChannels?.length) {
      return
    }
    this.conferenceChannels.forEach(channel => {
      deRegister(this.session.relayProtocol, null, channel)
      this.session.removeChannelCallIdEntry(channel, this.id)
    })
    this.session.vertoUnsubscribe({
      nodeId: this.nodeId,
      channels: this.conferenceChannels,
    }).catch((error) => {
      logger.error('Conference unsubscribe error:', error)
    })
  }

  private async _changeHold(action: string) {
    if (this._state >= State.Hangup) {
      return logger.warn('This call is not active', this.id, this.state)
    }
    const msg = new Modify({ ...this.messagePayload, action })
    try {
      const { holdState } = await this._execute(msg)
      holdState === 'active' ? this.setState(State.Active) : this.setState(State.Held)
      return true
    } catch (error) {
      logger.error('Error changing hold state', error)
      return false
    }
  }

  private _hangup(params: IHangupParams = {}) {
    const { cause = 'NORMAL_CLEARING', causeCode, code = '16', redirectDestination = null } = params
    this.cause = cause
    this.causeCode = code
    if (redirectDestination && this.trying) {
      return this.peer.executeInvite()
    }
    if (causeCode || cause === RTCErrorCode.IncompatibleDestination) {
      this.peer.stop()
    }
    this.setState(State.Hangup)
  }

  private _onMediaError(error: any) {
    this._dispatchNotification({ type: Notification.UserMediaError, error })
    this._hangup()
  }

  private _onGenericEvent(params: any) {
    this._dispatchNotification({ ...params, type: Notification.Generic })
  }

  private _onParticipantData(params: any) {
    // TODO: manage caller_id_name, caller_id_number, callee_id_name, callee_id_number
    const { display_name: displayName, display_number: displayNumber, display_direction, ...rest } = params
    this.extension = displayNumber
    const displayDirection = display_direction === Direction.Inbound ? Direction.Outbound : Direction.Inbound
    this._dispatchNotification({ type: Notification.ParticipantData, displayName, displayNumber, displayDirection, ...rest })
  }

  private async _onVertoAnswer(params: any) {
    if (this._state >= State.Active) {
      return
    }
    if (!this.gotEarly) {
      await this.peer.onRemoteSdp(params.sdp)
    }
    this.isDirect = checkIsDirectCall(params)
    // this.setState(State.Active)
  }

  private async _onVertoMedia(params: any) {
    if (this._state >= State.Early) {
      return
    }
    this.gotEarly = true
    await this.peer.onRemoteSdp(params.sdp)
    this.isDirect = checkIsDirectCall(params)
    this.setState(State.Early)
  }

  private _onVertoMediaParams(params: any) {
    const { mediaParams } = params
    if (this.options.autoApplyMediaParams === false) {
      return this._dispatchNotification({ type: Notification.MediaParams, mediaParams })
    }
    if (this.peer && mediaParams) {
      Object.keys(mediaParams).forEach(kind => {
        this.peer.applyMediaConstraints(kind, mediaParams[kind])
      })
    }
  }

  private _onVertoPrompt(params: any) {
    const notification = { ...params, promptType: params.type, type: Notification.Prompt, call: this }
    this._dispatchNotification(notification)
  }

  public _dispatchNotification(notification: any) {
    if (this.options.skipNotifications === true) {
      return
    }
    notification.call = this
    if (!trigger(this.id, notification, SwEvent.Notification, false)) {
      trigger(SwEvent.Notification, notification, this.session.uuid)
    }
  }

  public _dispatchConferenceUpdate(params: any) {
    this._dispatchNotification({ type: Notification.ConferenceUpdate, ...params })
  }

  public _execute(msg: BaseMessage) {
    if (this.nodeId) {
      msg.targetNodeId = this.nodeId
    }
    const { requestTimeout = 10000 } = this.options
    return Promise.race([
      new Promise((_resolve, reject) => setTimeout(reject, requestTimeout, 'timeout')),
      this.session.execute(msg),
    ])
  }

  private async _onVertoAttach(params: any) {

    if (this.options.simulcast === true) {
      logger.warn('Handle verto.attach for a simulcast call?', params)
    }

    // FIXME: need to dispatch a participantData notification??
    switch (this._state) {
      case State.New:
        this.session.autoRecoverCalls ? this.answer() : this.setState(State.Recovering)
        break
      case State.Active: {
        if (this.doReinvite) {
          console.debug('doReinvite IS ACTIVE!', params)
          return logger.warn('>>>> This leg alreay sent a reinvite??')
        }
        // TODO: force peer.type to be an Answer
        this.peer.type = PeerType.Answer
        this.options.remoteSdp = params.sdp
        const stream = await getUserMedia({ video: true })
        stream.getVideoTracks().forEach(t => {
          this.options.localStream.addTrack(t)
          this.peer.instance.addTrack(t, this.options.localStream)
        })
        break
      }
    }
  }

  private _init() {
    const { id, userVariables, remoteCallerNumber, onNotification } = this.options
    if (!id) {
      this.options.id = uuidv4()
    }
    this.id = this.options.id
    if (!userVariables || objEmpty(userVariables)) {
      this.options.userVariables = this.session.options.userVariables || {}
    }
    this.options.userVariables.hostname = getHostname()
    if (!remoteCallerNumber) {
      this.options.remoteCallerNumber = this.options.destinationNumber
    }
    this.session.calls[this.id] = this

    if (isFunction(onNotification)) {
      register(this.id, onNotification.bind(this), SwEvent.Notification)
    }
    register(this.id, this._onMediaError, SwEvent.MediaError)
    register(this.id, this._onVertoAnswer, VertoMethod.Answer)
    register(this.id, this._onVertoMedia, VertoMethod.Media)
    register(this.id, this._onVertoMediaParams, VertoMethod.MediaParams)
    register(this.id, this._onVertoPrompt, VertoMethod.Prompt)
    register(this.id, this._hangup, VertoMethod.Bye)
    register(this.id, this._onParticipantData, VertoMethod.Display)
    register(this.id, this._onVertoAttach, VertoMethod.Attach)
    register(this.id, this._onGenericEvent, VertoMethod.Info)
    register(this.id, this._onGenericEvent, VertoMethod.Event)

    this.setState(State.New)
    logger.info('New Call with Options:', this.options)
  }

  protected _finalize() {
    if (this.peer && this.peer.instance) {
      this.peer.instance.close()
      this.peer = null
    }
    this._removeConferenceChannels()
    const { remoteStream, localStream } = this.options
    stopStream(remoteStream)
    stopStream(localStream)
    deRegisterAll(this.id)
    this.session.calls[this.id] = null
    delete this.session.calls[this.id]
  }
}
