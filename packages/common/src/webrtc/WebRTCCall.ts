import { v4 as uuidv4 } from 'uuid'
import logger from '../util/logger'
import BrowserSession from '../BrowserSession'
import BaseMessage from '../messages/BaseMessage'
import RTCPeer from './RTCPeer'
import { Bye, Info, Modify } from '../messages/Verto'
import { SwEvent } from '../util/constants'
import { State, DEFAULT_CALL_OPTIONS, Role, PeerType, VertoMethod, Notification, Direction } from './constants'
import { trigger, register, deRegisterAll } from '../services/Handler'
import { enableAudioTracks, disableAudioTracks, toggleAudioTracks, enableVideoTracks, disableVideoTracks, toggleVideoTracks } from './helpers'
import { objEmpty, isFunction } from '../util/helpers'
import { CallOptions, IHangupParams, ICallParticipant } from './interfaces'
import { detachMediaStream, stopStream, setMediaElementSinkId, getUserMedia } from '../util/webrtc'
import Conference from './Conference'
import { InjectConferenceMethods, CheckConferenceMethod } from './decorators'

@InjectConferenceMethods()
export default abstract class WebRTCCall {
  public id: string = ''
  public nodeId: string
  public direction: Direction
  public peer: RTCPeer
  public options: CallOptions
  public conference: Conference
  public cause: string
  public causeCode: string
  public extension: string = null
  public gotEarly = false
  public screenShare?: WebRTCCall
  public secondSource?: WebRTCCall
  public doReinvite = false

  private _state: State = State.New
  private _prevState: State = State.New

  startScreenShare?(opts?: CallOptions): Promise<WebRTCCall>
  stopScreenShare?(): void
  addSecondSource?(opts?: CallOptions): Promise<WebRTCCall>
  removeSecondSource?(): void
  setAudioOutDevice?(deviceId: string): Promise<boolean>
  switchCamera?(): void
  setSpeakerPhone?(flag: boolean): void

  sendChatMessage?(message: string, type: string): void
  listVideoLayouts?(): void
  playMedia?(file: string): void
  stopMedia?(): void
  startRecord?(file: string): void
  stopRecord?(): void
  snapshot?(file: string): void
  setVideoLayout?(layout: string, canvasID: number): void
  presenter?(participantId?: string): void
  videoFloor?(participantId?: string): void
  banner?(text: string, participantId?: string): void
  volumeDown?(participantId?: string): void
  volumeUp?(participantId?: string): void
  gainDown?(participantId?: string): void
  gainUp?(participantId?: string): void
  kick?(participantId?: string): void
  toggleNoiseBlocker?(participantId: string, value: string): void
  toggleLowBitrateMode?(participantId: string, value: string): void
  addToCall?(value: string): void
  toggleHandRaised?(participantId: string, value?: string): void
  confQuality?(value: string): void
  confFullscreen?(participantId: string, value?: string): void
  modCommand?(command: string, participantId?: string, value?: string): void

  constructor(protected session: BrowserSession, opts?: CallOptions) {
    const { iceServers, speaker: speakerId, micId, micLabel, camId, camLabel, localElement, remoteElement, mediaConstraints: { audio, video } } = session
    this.options = Object.assign({}, DEFAULT_CALL_OPTIONS, { audio, video, iceServers, localElement, remoteElement, micId, micLabel, camId, camLabel, speakerId }, opts)

    this._onMediaError = this._onMediaError.bind(this)
    this._onVertoAnswer = this._onVertoAnswer.bind(this)
    this._onVertoAttach = this._onVertoAttach.bind(this)
    this._onVertoMedia = this._onVertoMedia.bind(this)
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
    return { sessid: this.session.sessionid, dialogParams: this.options }
  }

  get currentParticipant(): Partial<ICallParticipant> {
    return this.conference ? this.conference.currentParticipant : {}
  }

  get role() {
    return this.conference ? this.conference.participantRole : Role.Participant
  }

  // secondSource and screenShare calls are not "main"
  get isMainCall() {
    const { screenShare, secondSource } = this.options
    return !screenShare && !secondSource
  }

  invite() {
    this.direction = Direction.Outbound
    this.peer = new RTCPeer(this, PeerType.Offer, this.options)
  }

  answer() {
    this.direction = Direction.Inbound
    this.peer = new RTCPeer(this, PeerType.Answer, this.options)
  }

  hangup(params?: IHangupParams) {
    const bye = new Bye(this.messagePayload)
    return this._execute(bye)
      .catch(error => logger.error('Hangup error:', error))
      .then(() => this._hangup(params))
  }

  dtmf(dtmf: string) {
    const msg = new Info({ ...this.messagePayload, dtmf })
    this._execute(msg)
  }

  @CheckConferenceMethod
  transfer(destination: string, id?: string) {
    const msg = new Modify({ ...this.messagePayload, action: 'transfer', destination })
    this._execute(msg)
  }

  replace(callId: string) {
    const msg = new Modify({ ...this.messagePayload, action: 'replace', replaceCallID: callId })
    this._execute(msg)
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

  @CheckConferenceMethod
  muteAudio(participantId?: string) {
    disableAudioTracks(this.options.localStream)
  }

  @CheckConferenceMethod
  unmuteAudio(participantId?: string) {
    enableAudioTracks(this.options.localStream)
  }

  @CheckConferenceMethod
  toggleAudioMute(participantId?: string) {
    toggleAudioTracks(this.options.localStream)
  }

  @CheckConferenceMethod
  muteVideo(participantId?: string) {
    disableVideoTracks(this.options.localStream)
  }

  @CheckConferenceMethod
  unmuteVideo(participantId?: string) {
    enableVideoTracks(this.options.localStream)
  }

  @CheckConferenceMethod
  toggleVideoMute(participantId?: string) {
    toggleVideoTracks(this.options.localStream)
  }

  @CheckConferenceMethod
  deaf(participantId?: string) {
    disableAudioTracks(this.options.remoteStream)
  }

  @CheckConferenceMethod
  undeaf(participantId?: string) {
    enableAudioTracks(this.options.remoteStream)
  }

  @CheckConferenceMethod
  toggleDeaf(participantId?: string) {
    toggleAudioTracks(this.options.remoteStream)
  }

  stopOutboundAudio() {
    if (this.peer) {
      this.peer.stopTrackSender('audio')
    }
  }

  restoreOutboundAudio() {
    if (this.peer) {
      this.peer.restoreTrackSender('audio')
    }
  }

  stopOutboundVideo() {
    if (this.peer) {
      this.peer.stopTrackSender('video')
    }
  }

  restoreOutboundVideo() {
    if (this.peer) {
      this.peer.restoreTrackSender('video')
    }
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

  setState(state: State) {
    this._prevState = this._state
    this._state = state
    logger.info(`Call ${this.id} state change from ${this.prevState} to ${this.state}`)

    this._dispatchNotification({ type: Notification.CallUpdate })

    switch (state) {
      case State.Purge:
        this._hangup({ cause: 'PURGE', code: '01' })
        break
      case State.Active: {
        setTimeout(() => {
          const { remoteElement, speakerId } = this.options
          if (remoteElement && speakerId) {
            setMediaElementSinkId(remoteElement, speakerId)
          }
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
        if (this.conference instanceof Conference) {
          this.conference.destroy().then(() => this._finalize())
        } else {
          this._finalize()
        }
        break
    }
  }

  private async _changeHold(action: string) {
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
    this.cause = params.cause || 'NORMAL_CLEARING'
    this.causeCode = params.code || '16'
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
    const { display_name: displayName, display_number: displayNumber, display_direction } = params
    this.extension = displayNumber
    const displayDirection = display_direction === Direction.Inbound ? Direction.Outbound : Direction.Inbound
    this._dispatchNotification({ type: Notification.ParticipantData, displayName, displayNumber, displayDirection })
  }

  private async _onVertoAnswer(params: any) {
    if (this._state >= State.Active) {
      return
    }
    if (!this.gotEarly) {
      await this.peer.onRemoteSdp(params.sdp)
    }
    this.setState(State.Active)
  }

  private _onVertoMedia(params: any) {
    if (this._state >= State.Early) {
      return
    }
    this.gotEarly = true
    this.peer.onRemoteSdp(params.sdp)
    this.setState(State.Early)
  }

  private _onVertoMediaParams(params: any) {
    const { mediaParams } = params
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
    if (this.isMainCall === false) {
      return
    }
    notification.call = this
    if (!trigger(this.id, notification, SwEvent.Notification, false)) {
      trigger(SwEvent.Notification, notification, this.session.uuid)
    }
  }

  public _execute(msg: BaseMessage) {
    if (this.nodeId) {
      msg.targetNodeId = this.nodeId
    }
    return Promise.race([
      new Promise((_resolve, reject) => setTimeout(reject, 3000, 'timeout')),
      this.session.execute(msg),
    ])
  }

  private async _onVertoAttach(params: any) {
    // FIXME: need to dispatch a participantData notification??
    switch (this._state) {
      case State.New:
        this.session.autoRecoverCalls ? this.answer() : this.setState(State.Recovering)
        break
      case State.Active: {
        if (this.doReinvite) {
          return logger.warn('>>>> This leg alreay sent a reinvite??')
        }
        // TODO: force peer.type to an Answer
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
    if (!this.isMainCall) {
      this.options.recoverCall = false
    }
    if (!userVariables || objEmpty(userVariables)) {
      this.options.userVariables = this.session.options.userVariables || {}
    }
    this.options.userVariables.hostname = window.location.hostname
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
    delete this.conference
    const { remoteStream, localStream, remoteElement, localElement } = this.options
    stopStream(remoteStream)
    stopStream(localStream)
    if (this.isMainCall) {
      detachMediaStream(remoteElement)
      detachMediaStream(localElement)
    }
    deRegisterAll(this.id)
    this.session.calls[this.id] = null
    delete this.session.calls[this.id]
  }
}
