import { v4 as uuidv4 } from 'uuid'
import logger from '../util/logger'
import BaseSession from '../BaseSession'
import { Invite, Answer, Attach, Bye, Modify, Info } from '../messages/Verto'
import Peer from './Peer'
import { DialogState as State, DialogDirection as Direction, PeerType, VertoMethod, SwEvent, NOTIFICATION_TYPE, DEFAULT_DIALOG_OPTIONS, ConferenceAction, DialogRole } from '../util/constants'
import { trigger, register, deRegister } from '../services/Handler'
import { streamIsValid } from '../services/RTCService'
import { objEmpty, mutateLiveArrayData } from '../util/helpers'
import { attachMediaStream, detachMediaStream } from '../util/webrtc'
import { DialogOptions } from '../interfaces/'

export default class Dialog {
  public id: string = ''
  public state: string = State[State.New]
  public direction: Direction
  public peer: Peer
  public options: DialogOptions
  public cause: string
  public causeCode: number
  public channels: string[] = []
  public role: string = DialogRole.Participant

  private _state: State = State.New
  private _prevState: State = State.New
  private gotAnswer: boolean = false
  private gotEarly: boolean = false
  private _lastSerno: number = 0

  constructor(private session: BaseSession, opts?: DialogOptions) {
    this.options = Object.assign({}, DEFAULT_DIALOG_OPTIONS, session.defaultRtcDevices, opts)

    this._onMediaError = this._onMediaError.bind(this)
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

  get localStream() {
    return this.options.localStream
  }

  get remoteStream() {
    return this.options.remoteStream
  }

  setState(state: State) {
    this._prevState = this._state
    this._state = state
    this.state = State[this._state].toLowerCase()
    logger.debug('Dialog %s state change from %s to %s', this.id, State[this._prevState].toLowerCase(), this.state)

    this._dispatchDialogUpdate()

    switch (state) {
      case State.Purge:
        this.hangup({ cause: 'PURGE_DIALOGS', causeCode: '01' }, false)
        break
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
      case VertoMethod.Info:
      case VertoMethod.Display:
      case VertoMethod.Event:
      case VertoMethod.Attach: {
        const type = NOTIFICATION_TYPE.hasOwnProperty(method) ? NOTIFICATION_TYPE[method] : NOTIFICATION_TYPE.generic
        const notification = { ...params, type, dialog: this }
        if (notification.hasOwnProperty('sdp')) {
          delete notification.sdp
        }
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

  async handleConferenceUpdate(packet: any, initialPvtData: any) {
    // FIXME: 'reorder' - changepage' - 'heartbeat' methods not implemented
    if (!this._checkConferenceSerno(packet.wireSerno) && packet.name !== initialPvtData.laName) {
      logger.error('ConferenceUpdate invalid wireSerno or packet name:', packet)
      return 'INVALID_PACKET'
    }
    const { action, data, hashKey: callId = String(this._lastSerno), arrIndex: index } = packet
    switch (action) {
      case 'bootObj': {
        this._lastSerno = 0
        const { chatID, chatChannel, infoChannel, modChannel, laName, conferenceMemberID, role } = initialPvtData
        this._dispatchConferenceUpdate({ action: ConferenceAction.Join, conferenceName: laName, participantId: Number(conferenceMemberID), role })
        if (chatChannel) {
          await this._subscribeConferenceChat(chatChannel)
        }
        if (infoChannel) {
          await this._subscribeConferenceInfo(infoChannel)
        }
        if (modChannel && role === DialogRole.Moderator) {
          await this._subscribeConferenceModerator(modChannel)
        }
        const participants = []
        for (const i in data) {
          participants.push({ callId: data[i][0], index: Number(i), ...mutateLiveArrayData(data[i][1]) })
        }
        this._dispatchConferenceUpdate({ action: ConferenceAction.Bootstrap, participants })
        break
      }
      case 'add': {
        this._dispatchConferenceUpdate({ action: ConferenceAction.Add, callId, index, ...mutateLiveArrayData(data) })
        break
      }
      case 'modify':
        this._dispatchConferenceUpdate({ action: ConferenceAction.Modify, callId, index, ...mutateLiveArrayData(data) })
        break
      case 'del':
        this._dispatchConferenceUpdate({ action: ConferenceAction.Delete, callId, index, ...mutateLiveArrayData(data) })
        break
      case 'clear':
        this._dispatchConferenceUpdate({ action: ConferenceAction.Clear })
        break
      // case 'reorder':
      //   break
      default:
        this._dispatchConferenceUpdate({ action, data, callId, index })
        break
    }
  }

  _addChannel(channel: string): void {
    if (!this.channels.includes(channel)) {
      this.channels.push(channel)
    }
    this.session.subscriptions[channel] = {
      ...this.session.subscriptions[channel], dialogId: this.id
    }
  }

  private async _subscribeConferenceChat(channel: string) {
    const tmp = {
      channels: [channel],
      handler: (params: any) => {
        logger.debug('_subscribeConferenceChat handler', params)
        const { direction, from: participantNumber, fromDisplay: participantName, message: messageText, type: messageType } = params.data
        this._dispatchConferenceUpdate({ action: ConferenceAction.ChatMessage, direction, participantNumber, participantName, messageText, messageType, messageId: params.eventSerno })
      }
    }
    const response = await this.session.subscribe(tmp)
      .catch((error: any) => error)
    const { subscribedChannels = [] } = response
    if (subscribedChannels.includes(channel)) {
      this._addChannel(channel)
      Object.defineProperties(this, {
        sendChatMessage: {
          value: (message: string, type: string) => {
            this.session.broadcast({ channel, data: { action: 'send', message, type } })
          }
        }
      })
    }
  }

  private async _subscribeConferenceInfo(channel: string) {
    const tmp = {
      channels: [channel],
      handler: (params: any) => {
        logger.debug('_subscribeConferenceInfo handler', params)
        const { eventData: data } = params
        switch (data.contentType) {
          case 'layout-info':
            const tmp = JSON.stringify(data.canvasInfo).replace(/ID"/g, 'Id"').replace(/POS"/g, 'Pos"')
            this._dispatchConferenceUpdate({ action: ConferenceAction.LayoutInfo, data: JSON.parse(tmp) })
            break
          default:
            logger.error('Conference-Info unknown contentType', params)
        }
      }
    }
    const response = await this.session.subscribe(tmp)
      .catch((error: any) => error)
    const { subscribedChannels = [] } = response
    if (subscribedChannels.includes(channel)) {
      this._addChannel(channel)
    }
  }

  private async _subscribeConferenceModerator(channel: string) {
    const _modCommand = (command: string, memberID: any = null, value: any = null): void => {
      const application = 'conf-control'
      const id = parseInt(memberID) || null
      this.session.broadcast({ channel, data: { application, command, id, value } })
    }

    const _videoRequired = (): void => {
      const { video } = this.options
      if ((typeof video === 'boolean' && !video) || (typeof video === 'object' && objEmpty(video))) {
        throw `Conference ${this.id} has no video!`
      }
    }

    const tmp = {
      channels: [channel],
      handler: (params: any) => {
        logger.debug('_subscribeConferenceModerator handler', params)
        const { data } = params
        switch (data['conf-command']) {
          case 'list-videoLayouts':
            if (data.responseData) {
              const tmp = JSON.stringify(data.responseData).replace(/IDS"/g, 'Ids"')
              // TODO: revert layouts JSON structure
              this._dispatchConferenceUpdate({ action: ConferenceAction.LayoutList, layouts: JSON.parse(tmp) })
            }
            break
          default:
            this._dispatchConferenceUpdate({ action: ConferenceAction.ModCmdResponse, command: data['conf-command'], response: data.response })
        }
      }
    }
    const response = await this.session.subscribe(tmp)
      .catch((error: any) => error)
    const { subscribedChannels = [] } = response
    if (subscribedChannels.includes(channel)) {
      this.role = DialogRole.Moderator
      this._addChannel(channel)
      Object.defineProperties(this, {
        listVideoLayouts: {
          value: () => {
            _modCommand('list-videoLayouts')
          }
        },
        play: {
          value: (file: string) => {
            _modCommand('play', null, file)
          }
        },
        stop: {
          value: () => {
            _modCommand('stop', null, 'all')
          }
        },
        deaf: {
          value: (memberID: number | string) => {
            _modCommand('deaf', memberID)
          }
        },
        undeaf: {
          value: (memberID: number | string) => {
            _modCommand('undeaf', memberID)
          }
        },
        record: {
          value: (file: string) => {
            _modCommand('recording', null, ['start', file])
          }
        },
        stopRecord: {
          value: () => {
            _modCommand('recording', null, ['stop', 'all'])
          }
        },
        snapshot: {
          value: (file: string) => {
            _videoRequired()
            _modCommand('vid-write-png', null, file)
          }
        },
        setVideoLayout: {
          value: (layout: string, canvasID: number) => {
            _videoRequired()
            const value = canvasID ? [layout, canvasID] : layout
            _modCommand('vid-layout', null, value)
          }
        },
        kick: {
          value: (memberID: number | string) => {
            _modCommand('kick', memberID)
          }
        },
        muteMic: {
          value: (memberID: number | string) => {
            _modCommand('tmute', memberID)
          }
        },
        muteVideo: {
          value: (memberID: number | string) => {
            _videoRequired()
            _modCommand('tvmute', memberID)
          }
        },
        presenter: {
          value: (memberID: number | string) => {
            _videoRequired()
            _modCommand('vid-res-id', memberID, 'presenter')
          }
        },
        videoFloor: {
          value: (memberID: number | string) => {
            _videoRequired()
            _modCommand('vid-floor', memberID, 'force')
          }
        },
        banner: {
          value: (memberID: number | string, text: string) => {
            _videoRequired()
            _modCommand('vid-banner', memberID, encodeURI(text))
          }
        },
        volumeDown: {
          value: (memberID: number | string) => {
            _modCommand('volume_out', memberID, 'down')
          }
        },
        volumeUp: {
          value: (memberID: number | string) => {
            _modCommand('volume_out', memberID, 'up')
          }
        },
        gainDown: {
          value: (memberID: number | string) => {
            _modCommand('volume_in', memberID, 'down')
          }
        },
        gainUp: {
          value: (memberID: number | string) => {
            _modCommand('volume_in', memberID, 'up')
          }
        },
        transfer: {
          value: (memberID: number | string, exten: string) => {
            _modCommand('transfer', memberID, exten)
          }
        }
      })
    }
  }

  private _handleChangeHoldStateSuccess(response) {
    response.holdState === 'active' ? this.setState(State.Active) : this.setState(State.Held)
    return true
  }

  private _handleChangeHoldStateError(error) {
    logger.error('Failed to %s dialog %s', error.action, this.id, error)
    return false
  }

  private _onRemoteSdp(sdp: string) {
    this.peer.instance.setRemoteDescription({ sdp, type: PeerType.Answer })
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

  private _onIceSdp(data: RTCSessionDescription) {
    // TODO: Blade needs a differ wrapper (maybe BladeInvite & BladeAnswer ?!)
    let msg = null
    const tmpParams = { sessid: this.session.sessionid, sdp: data.sdp, dialogParams: this.options }
    if (data.type === PeerType.Offer) {
      this.setState(State.Requesting)
      msg = new Invite(tmpParams)
    } else if (data.type === PeerType.Answer) {
      this.setState(State.Answering)
      msg = this.options.attach === true ? new Attach(tmpParams) : new Answer(tmpParams)
    } else {
      logger.warn('Unknown SDP type:', data)
      return
    }
    this.session.execute(msg)
      .then(response => {
        if (data.type === PeerType.Offer) {
          this.setState(State.Trying)
        } else if (data.type === PeerType.Answer) {
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
        // logger.warn(' - onIceCandidate:', event.candidate)
      } else {
        this._onIceSdp(instance.localDescription)
      }
    }

    instance.ontrack = event => {
      this.options.remoteStream = event.streams[0]

      const { remoteElementId = '', remoteStream } = this.options
      attachMediaStream(remoteElementId, remoteStream)
    }
  }

  private _checkConferenceSerno = (serno: number) => {
    const check = (serno < 0) || (!this._lastSerno || (this._lastSerno && serno === (this._lastSerno + 1)))
    if (check && serno >= 0) {
      this._lastSerno = serno
    }
    return check
  }

  private _onMediaError(error: any) {
    this._dispatchNotification({ type: NOTIFICATION_TYPE.userMediaError, error })
    this.hangup({}, false)
  }

  private _validCallback(name: string) {
    return this.options.hasOwnProperty(name) && this.options[name] instanceof Function
  }

  private _dispatchDialogUpdate() {
    this._dispatchNotification({ type: NOTIFICATION_TYPE.dialogUpdate, dialog: this })
  }

  private _dispatchConferenceUpdate(params: any) {
    this._dispatchNotification({ type: NOTIFICATION_TYPE.conferenceUpdate, dialog: this, ...params })
  }

  private _dispatchNotification(notification: any) {
    if (!trigger(SwEvent.Notification, notification, this.id, false)) {
      trigger(SwEvent.Notification, notification, this.session.uuid)
    }
  }

  private _init() {
    const { id, userVariables, remoteCallerNumber } = this.options
    if (!id) {
      this.options.id = uuidv4()
    }
    if (!userVariables || objEmpty(userVariables)) {
      this.options.userVariables = this.session.options.userVariables || {}
    }
    if (!remoteCallerNumber) {
      this.options.remoteCallerNumber = this.options.destinationNumber
    }
    this.id = this.options.id
    this.session.dialogs[this.id] = this

    // Register Handlers
    register(SwEvent.MediaError, this._onMediaError, this.id)
    if (this._validCallback('onNotification')) {
      register(SwEvent.Notification, this.options.onNotification.bind(this), this.id)
    }

    this.setState(State.New)
    logger.info('New Dialog with Options:', this.options)
  }

  private _finalize() {
    const { remoteStream, localStream, remoteElementId = '', localElementId = '' } = this.options
    if (streamIsValid(remoteStream)) {
      remoteStream.getTracks().forEach(t => t.stop())
      this.options.remoteStream = null
    }
    if (streamIsValid(localStream)) {
      localStream.getTracks().forEach(t => t.stop())
      this.options.localStream = null
    }
    detachMediaStream(localElementId)
    detachMediaStream(remoteElementId)

    deRegister(SwEvent.MediaError, null, this.id)
    this.peer = null
    this.session.dialogs[this.id] = null
    delete this.session.dialogs[this.id]
  }
}
