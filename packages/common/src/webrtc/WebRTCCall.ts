import { v4 as uuidv4 } from 'uuid'
import logger from '../util/logger'
import BrowserSession from '../BrowserSession'
import BaseMessage from '../messages/BaseMessage'
import { Invite, Answer, Attach, Bye, Modify, Info } from '../messages/Verto'
import RTCPeer from './RTCPeer'
import { SwEvent } from '../util/constants'
import { State, DEFAULT_CALL_OPTIONS, ConferenceAction, Role, PeerType, VertoMethod, Notification, Direction } from './constants'
import { trigger, register, deRegister, deRegisterAll } from '../services/Handler'
import { sdpStereoHack, sdpMediaOrderHack, checkSubscribeResponse, enableAudioTracks, disableAudioTracks, toggleAudioTracks, enableVideoTracks, disableVideoTracks, toggleVideoTracks } from './helpers'
import { objEmpty, mutateLiveArrayData, isFunction } from '../util/helpers'
import { CallOptions, IWebRTCCall } from './interfaces'
import { attachMediaStream, detachMediaStream, sdpToJsonHack, stopStream, getUserMedia, setMediaElementSinkId } from '../util/webrtc'
import { MCULayoutEventHandler } from './LayoutHandler'

export default class WebRTCCall {
  public id: string = ''
  public direction: Direction
  public peer: RTCPeer
  public options: CallOptions
  public cause: string
  public causeCode: number
  public channels: string[] = []
  public role: string = Role.Participant
  public extension: string = null
  public gotAnswer = false
  public gotEarly = false

  private _state: State = State.New
  private _prevState: State = State.New
  private _lastSerno: number = 0
  private _targetNodeId: string = null

  constructor(protected session: BrowserSession, opts?: CallOptions) {
    const { iceServers, speaker: speakerId, micId, micLabel, camId, camLabel, localElement, remoteElement, mediaConstraints: { audio, video } } = session
    this.options = Object.assign({}, DEFAULT_CALL_OPTIONS, { audio, video, iceServers, localElement, remoteElement, micId, micLabel, camId, camLabel, speakerId }, opts)

    this._onMediaError = this._onMediaError.bind(this)
    this._onVertoAnswer = this._onVertoAnswer.bind(this)
    this._onVertoMedia = this._onVertoMedia.bind(this)
    this._hangup = this._hangup.bind(this)
    this._onParticipantData = this._onParticipantData.bind(this)
    this._onGenericEvent = this._onGenericEvent.bind(this)
    this._init()
  }

  get state() {
    return State[this._state].toLowerCase()
  }

  get prevState() {
    return State[this._prevState].toLowerCase()
  }

  get nodeId() {
    return this._targetNodeId
  }

  set nodeId(nodeId: string) {
    this._targetNodeId = nodeId
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

  invite() {
    this.direction = Direction.Outbound
    this.peer = new RTCPeer(this, PeerType.Offer, this.options)
  }

  answer() {
    this.direction = Direction.Inbound
    this.peer = new RTCPeer(this, PeerType.Answer, this.options)
  }

  hangup(params: any = {}) {
    const bye = new Bye(this.messagePayload)
    this._execute(bye).catch(error => logger.error('Hangup error:', error))
    this._hangup(params)
  }

  dtmf(dtmf: string) {
    const msg = new Info({ sessid: this.session.sessionid, dtmf, dialogParams: this.options })
    this._execute(msg)
  }

  setState(state: State) {
    this._prevState = this._state
    this._state = state
    logger.info(`Call ${this.id} state change from ${this.prevState} to ${this.state}`)

    this._dispatchNotification({ type: Notification.CallUpdate, call: this })

    switch (state) {
      case State.Purge:
        this._hangup({ cause: 'PURGE', causeCode: '01' })
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
        this.setState(State.Destroy)
        break
      case State.Destroy:
        this._finalize()
        break
    }
  }

  private _hangup(params: any = {}) {
    this.cause = params.cause || 'NORMAL_CLEARING'
    this.causeCode = params.causeCode || 16
    this.setState(State.Hangup)
  }

  private _onMediaError(error: any) {
    this._dispatchNotification({ type: Notification.UserMediaError, error })
    this._hangup()
  }

  private _onGenericEvent(params: any) {
    this._dispatchNotification({ ...params, type: Notification.Generic, call: this })
  }

  private _onParticipantData(params: any) {
    // TODO: manage caller_id_name, caller_id_number, callee_id_name, callee_id_number
    const { display_name: displayName, display_number: displayNumber, display_direction } = params
    this.extension = displayNumber
    const displayDirection = display_direction === Direction.Inbound ? Direction.Outbound : Direction.Inbound
    this._dispatchNotification({ type: Notification.ParticipantData, call: this, displayName, displayNumber, displayDirection })
  }

  private _onVertoAnswer(params: any) {
    this.gotAnswer = true
    if (this._state >= State.Active) {
      return
    }
    if (this._state >= State.Early) {
      this.setState(State.Active)
    }
    if (!this.gotEarly) {
      this.peer.onRemoteSdp(params.sdp)
    }
  }

  private _onVertoMedia(params: any) {
    if (this._state >= State.Early) {
      return
    }
    this.gotEarly = true
    this.peer.onRemoteSdp(params.sdp)
  }

  private _dispatchNotification(notification: any) {
    if (this.options.screenShare === true) {
      return
    }
    if (!trigger(SwEvent.Notification, notification, this.id, false)) {
      trigger(SwEvent.Notification, notification, this.session.uuid)
    }
  }

  public _execute(msg: BaseMessage) {
    if (this.nodeId) {
      msg.targetNodeId = this.nodeId
    }
    return this.session.execute(msg)
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
    if (!remoteCallerNumber) {
      this.options.remoteCallerNumber = this.options.destinationNumber
    }
    // @ts-ignore
    this.session.calls[this.id] = this

    if (isFunction(onNotification)) {
      register(SwEvent.Notification, onNotification.bind(this), this.id)
    }

    register(this.id, this._onMediaError, SwEvent.MediaError)
    register(this.id, this._onVertoAnswer, VertoMethod.Answer)
    register(this.id, this._onVertoMedia, VertoMethod.Media)
    register(this.id, this._hangup, VertoMethod.Bye)
    register(this.id, this._onParticipantData, VertoMethod.Display)
    register(this.id, this._onParticipantData, VertoMethod.Attach)
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
    const { remoteStream, localStream, remoteElement, localElement } = this.options
    stopStream(remoteStream)
    stopStream(localStream)
    if (this.options.screenShare !== true) {
      detachMediaStream(remoteElement)
      detachMediaStream(localElement)
    }
    deRegisterAll(this.id)
    this.session.calls[this.id] = null
    delete this.session.calls[this.id]
  }
}
