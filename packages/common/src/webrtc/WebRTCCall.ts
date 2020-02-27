import { v4 as uuidv4 } from 'uuid'
import logger from '../util/logger'
import BrowserSession from '../BrowserSession'
import BaseMessage from '../messages/BaseMessage'
import { Invite, Answer, Attach, Bye, Modify, Info } from '../messages/Verto'
import RTCPeer from './RTCPeer'
import { SwEvent } from '../util/constants'
import { State, DEFAULT_CALL_OPTIONS, ConferenceAction, Role, PeerType, VertoMethod, NOTIFICATION_TYPE, Direction } from './constants'
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

  private _state: State = State.New
  private _prevState: State = State.New
  private gotAnswer: boolean = false
  private gotEarly: boolean = false
  private _lastSerno: number = 0
  private _targetNodeId: string = null
  private _iceTimeout = null
  private _iceDone: boolean = false

  constructor(protected session: BrowserSession, opts?: CallOptions) {
    const { iceServers, speaker: speakerId, micId, micLabel, camId, camLabel, localElement, remoteElement, mediaConstraints: { audio, video } } = session
    this.options = Object.assign({}, DEFAULT_CALL_OPTIONS, { audio, video, iceServers, localElement, remoteElement, micId, micLabel, camId, camLabel, speakerId }, opts)

    this._onMediaError = this._onMediaError.bind(this)
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

  invite() {
    this.direction = Direction.Outbound
    this.peer = new RTCPeer(this, PeerType.Offer, this.options)
  }

  answer() {
    this.direction = Direction.Inbound
    this.peer = new RTCPeer(this, PeerType.Answer, this.options)
  }

  hangup(params: any = {}, execute: boolean = true) {
    // FIXME: !!!!
    this.cause = params.cause || 'NORMAL_CLEARING'
    this.causeCode = params.causeCode || 16
    this.setState(State.Hangup)
    const _close = () => {
      this.peer ? this.peer.instance.close() : null
      this.setState(State.Destroy)
    }

    if (execute) {
      const bye = new Bye({ sessid: this.session.sessionid, dialogParams: this.options })
      this._execute(bye)
        .catch(error => logger.error('verto.bye failed!', error))
        .then(_close.bind(this))
    } else {
      _close()
    }
  }

  dtmf(dtmf: string) {
    const msg = new Info({ sessid: this.session.sessionid, dtmf, dialogParams: this.options })
    this._execute(msg)
  }

  setState(state: State) {
    this._prevState = this._state
    this._state = state
    logger.info(`Call ${this.id} state change from ${this.prevState} to ${this.state}`)

    this._dispatchNotification({ type: NOTIFICATION_TYPE.callUpdate, call: this })

    switch (state) {
      case State.Purge:
        this.hangup({ cause: 'PURGE', causeCode: '01' }, false)
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
      case State.Destroy:
        this._finalize()
        break
    }
  }

  handleMessage(msg: any) {
    const { method, params } = msg
    switch (method) {
      case VertoMethod.Answer: {
        this.gotAnswer = true
        if (this._state >= State.Active) {
          return
        }
        if (this._state >= State.Early) {
          this.setState(State.Active)
        }
        if (!this.gotEarly) {
          this._onRemoteSdp(params.sdp)
        }
        break
      }
      case VertoMethod.Media: {
        if (this._state >= State.Early) {
          return
        }
        this.gotEarly = true
        this._onRemoteSdp(params.sdp)
        break
      }
      case VertoMethod.Display:
      case VertoMethod.Attach: {
        // TODO: manage caller_id_name, caller_id_number, callee_id_name, callee_id_number
        const { display_name: displayName, display_number: displayNumber, display_direction } = params
        this.extension = displayNumber
        const displayDirection = display_direction === Direction.Inbound ? Direction.Outbound : Direction.Inbound
        const notification = { type: NOTIFICATION_TYPE[method], call: this, displayName, displayNumber, displayDirection }
        if (!trigger(SwEvent.Notification, notification, this.id)) {
          trigger(SwEvent.Notification, notification, this.session.uuid)
        }
        break
      }
      case VertoMethod.Info:
      case VertoMethod.Event: {
        const notification = { ...params, type: NOTIFICATION_TYPE.generic, call: this }
        if (!trigger(SwEvent.Notification, notification, this.id)) {
          trigger(SwEvent.Notification, notification, this.session.uuid)
        }
        break
      }
      case VertoMethod.Bye:
        this.hangup(params, false)
        break
    }
  }

  async _onLocalSdp() {
    const { sdp, type } = this.peer.instance.localDescription
    let msg = null
    const tmpParams = { sessid: this.session.sessionid, sdp, dialogParams: this.options }
    switch (type) {
      case PeerType.Offer:
        this.setState(State.Requesting)
        msg = new Invite(tmpParams)
        break
      case PeerType.Answer:
        this.setState(State.Answering)
        msg = this.options.attach === true ? new Attach(tmpParams) : new Answer(tmpParams)
        break
      default:
        logger.error(`${this.id} - Unknown local SDP type:`, this.peer.instance.localDescription)
        return this.hangup({}, false)
    }
    try {
      const response = await this._execute(msg)
      const { node_id = null } = response
      this._targetNodeId = node_id
      type === PeerType.Offer ? this.setState(State.Trying) : this.setState(State.Active)
    } catch (error) {
      logger.error(`${this.id} - Sending ${type} error:`, error)
      // FIXME: Maybe retry?
      this.hangup()
    }
  }

  private async _onRemoteSdp(sdp: string) {
    // let sdp = sdpMediaOrderHack(remoteSdp, this.peer.instance.localDescription.sdp)
    if (this.options.useStereo) {
      sdp = sdpStereoHack(sdp)
    }
    const sessionDescr: RTCSessionDescription = sdpToJsonHack({ sdp, type: PeerType.Answer })
    try {
      await this.peer.instance.setRemoteDescription(sessionDescr)
      if (this.gotEarly) {
        this.setState(State.Early)
      }
      if (this.gotAnswer) {
        this.setState(State.Active)
      }
    } catch (error) {
      logger.error('Call setRemoteDescription Error: ', error)
      // FIXME: Maybe retry?
      this.hangup()
    }
  }

  private _onMediaError(error: any) {
    this._dispatchNotification({ type: NOTIFICATION_TYPE.userMediaError, error })
    this.hangup({}, false)
  }

  private _dispatchNotification(notification: any) {
    if (this.options.screenShare === true) {
      return
    }
    if (!trigger(SwEvent.Notification, notification, this.id, false)) {
      trigger(SwEvent.Notification, notification, this.session.uuid)
    }
  }

  private _execute(msg: BaseMessage) {
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

    register(SwEvent.MediaError, this._onMediaError, this.id)
    if (isFunction(onNotification)) {
      register(SwEvent.Notification, onNotification.bind(this), this.id)
    }

    register(this.id, (params: any) => { console.log(VertoMethod.Answer, params) }, VertoMethod.Answer)
    register(this.id, (params: any) => { console.log(VertoMethod.Media, params) }, VertoMethod.Media)
    register(this.id, (params: any) => { console.log(VertoMethod.Display, params) }, VertoMethod.Display)
    register(this.id, (params: any) => { console.log(VertoMethod.Attach, params) }, VertoMethod.Attach)
    register(this.id, (params: any) => { console.log(VertoMethod.Info, params) }, VertoMethod.Info)
    register(this.id, (params: any) => { console.log(VertoMethod.Event, params) }, VertoMethod.Event)

    this.setState(State.New)
    logger.info('New Call with Options:', this.options)
  }

  protected _finalize() {
    const { remoteStream, localStream, remoteElement, localElement } = this.options
    stopStream(remoteStream)
    stopStream(localStream)
    if (this.options.screenShare !== true) {
      detachMediaStream(remoteElement)
      detachMediaStream(localElement)
    }
    deRegister(SwEvent.MediaError, null, this.id)
    deRegisterAll(this.id)
    this.peer = null
    this.session.calls[this.id] = null
    delete this.session.calls[this.id]
  }
}
