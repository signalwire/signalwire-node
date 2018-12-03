import { v4 as uuidv4 } from 'uuid'
import logger from '../util/logger'
import BaseSession from '../BaseSession'
import VertoLiveArray from '../VertoLiveArray'
import { Invite, Answer, Bye, Modify, Info } from '../messages/Verto'
import Peer from './Peer'
import { DialogState as State, DialogDirection as Direction, PeerType, VertoMethod, SwEvent } from '../util/constants'
import { trigger, register, deRegister } from '../services/Handler'
import { streamIsValid } from '../services/RTCService'
import { DialogOptions } from '../interfaces/'

const DEFAULT_OPTIONS: DialogOptions = {
  audio: true,
  video: false,
  useStereo: true,
  attach: false,
  screenShare: false,
  outgoingBandwidth: 'default',
  incomingBandwidth: 'default',
  remote_caller_id_name: 'Outbound Call',
  remote_caller_id_number: '',
  destination_number: '',
  caller_id_name: '',
  caller_id_number: '',
  userVariables: {},
  // videoParams: { minWidth: 1280, minHeight: 720, maxWidth: 1920, maxHeight: 1080, minFrameRate: 15 },
}

export default class Dialog {
  public callID: string = ''
  public state: string = State[State.New]
  public direction: Direction
  public peer: Peer
  public options: DialogOptions
  public cause: string
  public causeCode: number

  private _state: State = State.New
  private _prevState: State = State.New
  private gotAnswer: boolean = false
  private gotEarly: boolean = false
  private _liveArray: VertoLiveArray = null

  constructor(private session: BaseSession, opts?: DialogOptions) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, opts)

    this._onNotification = this._onNotification.bind(this)
    this._init()
  }

  invite () {
    this.direction = Direction.Outbound
    this.peer = new Peer(PeerType.Offer, this.options)
    this._registerPeerEvents()
  }

  answer () {
    this.direction = Direction.Inbound
    this.peer = new Peer(PeerType.Answer, this.options)
    this._registerPeerEvents()
  }

  hangup(params: any = {}, execute: boolean = true) {
    this.cause = params.cause || 'NORMAL_CLEARING'
    this.causeCode = params.causeCode || 16
    this.setState(State.Hangup)
    const _close = () => {
      this.peer ? this.peer.instance.close() : this.setState(State.Destroy)
    }

    if (execute) {
      const bye = new Bye({ sessid: this.session.sessionid, dialogParams: this.options })
      this.session.execute(bye)
        .then(_close.bind(this))
        .catch(error => logger.error('verto.bye failed!', error))
    } else {
      _close()
    }
  }

  transfer(destination: string) {
    const msg = new Modify({ sessid: this.session.sessionid, action: 'transfer', destination, dialogParams: this.options })
    this.session.execute(msg)
  }

  hold() {
    const msg = new Modify({ sessid: this.session.sessionid, action: 'hold', dialogParams: this.options })
    return this.session.execute(msg)
      .then(this._handleChangeHoldStateSuccess.bind(this))
      .catch(this._handleChangeHoldStateError.bind(this))
  }

  unhold() {
    const msg = new Modify({ sessid: this.session.sessionid, action: 'unhold', dialogParams: this.options })
    return this.session.execute(msg)
      .then(this._handleChangeHoldStateSuccess.bind(this))
      .catch(this._handleChangeHoldStateError.bind(this))
  }

  toggleHold() {
    const msg = new Modify({ sessid: this.session.sessionid, action: 'toggleHold', dialogParams: this.options })
    return this.session.execute(msg)
      .then(this._handleChangeHoldStateSuccess.bind(this))
      .catch(this._handleChangeHoldStateError.bind(this))
  }

  dtmf(dtmf: string) {
    const msg = new Info({ sessid: this.session.sessionid, dtmf, dialogParams: this.options })
    this.session.execute(msg)
  }

  message(to: string, body: string) {
    const msg = { from: this.session.options.login, to, body }
    const info = new Info({ sessid: this.session.sessionid, msg, dialogParams: this.options })
    this.session.execute(info)
  }

  set audioState(what: boolean | string) {
    this.peer.audioState = what
  }

  get audioState() {
    return this.peer.audioState
  }

  set videoState(what: boolean | string) {
    this.peer.videoState = what
  }

  get videoState() {
    return this.peer.videoState
  }

  get clone() {
    // return Object.assign({}, this)
    return this
  }

  get localStream() {
    return this.options.localStream
  }

  get remoteStream() {
    return this.options.remoteStream
  }

  setState(state: State) {
    this._prevState = this._state
    this._state = state
    this.state = State[this._state]
    logger.warn('Dialog %s state change from %s to %s', this.callID, State[this._prevState], this.state)

    if (!trigger(SwEvent.VertoDialogChange, this.clone, this.callID, false)) {
      trigger(SwEvent.VertoDialogChange, this.clone, this.session.uuid)
    }

    switch (state) {
      case State.Destroy:
        this._finalize()
        break
    }
  }

  handleMessage(msg: any) {
    const { method, params } = msg
    switch (method) {
      case VertoMethod.Answer:
        this._onAnswer(params.sdp)
        break
      case VertoMethod.Media:
        this._onMedia(params.sdp)
        break
      case VertoMethod.Info:
        if (!trigger(SwEvent.VertoInfo, params, this.callID)) {
          trigger(SwEvent.VertoInfo, params, this.session.uuid)
        }
        break
      case VertoMethod.Display:
        if (!trigger(SwEvent.VertoDisplay, params, this.callID)) {
          trigger(SwEvent.VertoDisplay, params, this.session.uuid)
        }
        break
      case VertoMethod.Bye:
        this.hangup(params, false)
      break
    }
  }

  private _handleChangeHoldStateSuccess(response) {
    response.holdState === 'active' ? this.setState(State.Active) : this.setState(State.Held)
    return true
  }

  private _handleChangeHoldStateError(error) {
    logger.error('Failed to %s dialog %s', error.action, this.callID, error)
    return false
  }

  private _onAnswer(sdp: string) {
    this.gotAnswer = true
    if (this._state >= State.Active) {
      return
    }
    if (this._state >= State.Early) {
      this.setState(State.Active)
    }
    if (!this.gotEarly) {
      this._onRemoteSdp(sdp)
    }
  }

  private _onMedia(sdp: string) {
    if (this._state >= State.Early) {
      return
    }
    this.gotEarly = true
    this._onRemoteSdp(sdp)
  }

  private _onRemoteSdp(sdp: string) {
    this.peer.instance.setRemoteDescription({ sdp, type: 'answer' })
      .then(() => {
        if (this.gotEarly) {
          this.setState(State.Early)
        }
        if (this.gotAnswer) {
          this.setState(State.Active)
        }
      })
      .catch(error => {
        logger.error('Dialog setRemoteDescription Error: ', error)
        this.hangup()
      })
  }

  // private _onSdp(data: RTCSessionDescription) {
  //   logger.warn(' - onSdp:', data.sdp)
  // }

  private _onIce(data: RTCIceCandidate) {
    // logger.warn(' - onIce:', data)
  }

  private _onIceSdp(data: RTCSessionDescription) {
    // TODO: Blade needs a differ wrapper (maybe BladeInvite & BladeAnswer ?!)
    let msg = null
    if (data.type === 'offer') {
      this.setState(State.Requesting)
      msg = new Invite({ sessid: this.session.sessionid, sdp: data.sdp, dialogParams: this.options })
    } else if (data.type === 'answer') {
      msg = new Answer({ sessid: this.session.sessionid, sdp: data.sdp, dialogParams: this.options })
    }
    this.session.execute(msg)
      .then(response => {
        if (data.type === 'offer') {
          this.setState(State.Trying)
        } else if (data.type === 'answer') {
          this.setState(State.Active)
        }
      })
  }

  private _registerPeerEvents() {
    const { instance } = this.peer

    instance.oniceconnectionstatechange = event => {
      switch (instance.iceConnectionState) {
        case 'closed':
          this.setState(State.Destroy)
          break
      }
    }

    instance.onicecandidate = event => {
      if (event.candidate) {
        this._onIce(event.candidate)
      } else {
        this._onIceSdp(instance.localDescription)
      }
    }

    instance.ontrack = event => {
      this.options.remoteStream = event.streams[0]
    }
  }

  private _onNotification(pvtData: any) {
    const { action, laChannel = '', laName } = pvtData
    if (laChannel.indexOf(this.options.destination_number) === -1) {
      logger.warn('Invalid liveArray: it doesnt belong to this Dialog!')
      return
    }
    switch (action) {
      case 'conference-liveArray-join':
        const config = {
          onChange: this.options.onNotification.bind(this),
          onError: error => logger.error('LiveArray error', error),
          subParams: { callID: this.callID }
        }
        this._liveArray = new VertoLiveArray(this.session, laChannel, laName, config)
        break
      case 'conference-liveArray-part':
        if (this._liveArray) {
          this._liveArray.destroy()
          this._liveArray = null
        }
        break
    }
  }

  private _validCallback(name: string) {
    return this.options.hasOwnProperty(name) && this.options[name] instanceof Function
  }

  private _init() {
    if (!this.options.hasOwnProperty('callID') || !this.options.callID) {
      this.options.callID = uuidv4()
    }
    this.callID = this.options.callID
    this.session.dialogs[this.callID] = this

    // TODO: setup / execute / subscribe to Blade protocol-channels
    /*const be = new Execute({ protocol: 'verto', method: 'changeme-setup', params: {} })
    this.session.execute(be)
      .catch(error => {
        logger.error('Verto setup error', error)
      }) */

    // Register Handlers
    if (this._validCallback('onChange')) {
      register(SwEvent.VertoDialogChange, this.options.onChange.bind(this), this.callID)
    }
    if (this._validCallback('onUserMediaError')) {
      register(SwEvent.MediaError, this.options.onUserMediaError.bind(this), this.callID)
    }
    if (this._validCallback('onNotification')) {
      register(SwEvent.VertoPvtEvent, this._onNotification, this.session.uuid)
    }

    this.setState(State.New)
    logger.info('New Dialog with Options:', this.options)
  }

  private _finalize() {
    const { remoteStream, localStream } = this.options
    if (streamIsValid(remoteStream)) {
      remoteStream.getTracks().forEach(t => t.stop())
      this.options.remoteStream = null
    }
    if (streamIsValid(localStream)) {
      localStream.getTracks().forEach(t => t.stop())
      this.options.localStream = null
    }
    deRegister(SwEvent.VertoDialogChange, null, this.callID)
    deRegister(SwEvent.MediaError, null, this.callID)
    deRegister(SwEvent.VertoPvtEvent, this._onNotification, this.session.uuid)
    this.peer = null
    this.session.dialogs[this.callID] = null
    delete this.session.dialogs[this.callID]
  }
}
