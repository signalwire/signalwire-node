import logger from '../util/logger'
import { getUserMedia, getMediaConstraints } from './helpers'
import { sdpStereoHack, sdpBitrateHack, sdpMediaOrderHack } from './sdpHelpers'
import { SwEvent } from '../util/constants'
import { PeerType, State } from './constants'
import WebRTCCall from './WebRTCCall'
import { attachMediaStream, muteMediaElement, sdpToJsonHack, RTCPeerConnection, streamIsValid, buildAudioElementByTrack, buildVideoElementByTrack, stopTrack } from '../util/webrtc'
import { CallOptions } from './interfaces'
import { trigger } from '../services/Handler'
import { Invite, Attach, Answer, Modify } from '../messages/Verto'
import BaseMessage from '../messages/BaseMessage'

export default class RTCPeer {
  public instance: RTCPeerConnection
  private _iceTimeout = null
  private _negotiating = false

  constructor(
    public call: WebRTCCall,
    public type: PeerType,
    private options: CallOptions
  ) {
    logger.info('New Peer with type:', this.type, 'Options:', this.options)

    this._onIce = this._onIce.bind(this)
    this._init()
  }

  get isOffer() {
    return this.type === PeerType.Offer
  }

  get isAnswer() {
    return this.type === PeerType.Answer
  }

  get isSimulcast() {
    return this.options.simulcast === true
  }

  get isSfu() {
    return this.options.sfu === true
  }

  get hasExperimentalFlag() {
    return this.options.experimental === true
  }

  get hasAudioSender() {
    return this._getSenderByKind('audio') ? true : false
  }

  get hasVideoSender() {
    return this._getSenderByKind('video') ? true : false
  }

  get hasAudioReceiver() {
    return this._getReceiverByKind('audio') ? true : false
  }

  get hasVideoReceiver() {
    return this._getReceiverByKind('video') ? true : false
  }

  get config(): RTCConfiguration {
    const { iceServers = [], rtcPeerConfig = {} } = this.options
    const config: RTCConfiguration = {
      bundlePolicy: 'max-compat',
      iceServers,
      // @ts-ignore
      sdpSemantics: 'unified-plan',
      ...rtcPeerConfig,
    }
    logger.info('RTC config', config)
    return config
  }

  get localSdp() {
    return this.instance.localDescription.sdp
  }

  stopTrackSender(kind: string) {
    try {
      const sender = this._getSenderByKind(kind)
      if (!sender) {
        return logger.info(`There is not a '${kind}' sender to stop.`)
      }
      if (sender.track) {
        stopTrack(sender.track)
        this.options.localStream.removeTrack(sender.track)
      }
    } catch (error) {
      logger.error('RTCPeer stopTrackSender error', kind, error)
    }
  }

  async restoreTrackSender(kind: string) {
    try {
      const sender = this._getSenderByKind(kind)
      if (!sender) {
        return logger.info(`There is not a '${kind}' sender to restore.`)
      }
      if (sender.track && sender.track.readyState !== 'ended') {
        return logger.info(`There is already an active ${kind} track.`)
      }
      const constraints = await getMediaConstraints(this.options)
      const stream = await getUserMedia({ [kind]: constraints[kind] })
      if (streamIsValid(stream)) {
        const newTrack = stream.getTracks().find(t => t.kind === kind)
        await sender.replaceTrack(newTrack)
        this.options.localStream.addTrack(newTrack)
      }
    } catch (error) {
      logger.error('RTCPeer restoreTrackSender error', kind, error)
    }
  }

  getDeviceId(kind: string) {
    try {
      const sender = this._getSenderByKind(kind)
      if (!sender || !sender.track) {
        return null
      }
      const { deviceId = null } = sender.track.getSettings()
      return deviceId
    } catch (error) {
      logger.error('RTCPeer getDeviceId error', kind, error)
    }
  }

  getTrackSettings(kind: string) {
    try {
      const sender = this._getSenderByKind(kind)
      if (!sender || !sender.track) {
        return null
      }
      return sender.track.getSettings()
    } catch (error) {
      logger.error('RTCPeer getTrackSettings error', kind, error)
    }
  }

  getDeviceLabel(kind: string) {
    try {
      const sender = this._getSenderByKind(kind)
      if (!sender || !sender.track) {
        return null
      }
      return sender.track.label
    } catch (error) {
      logger.error('RTCPeer getDeviceLabel error', kind, error)
    }
  }

  restartIceWithRelayOnly() {
    try {
      const config = this.instance.getConfiguration()
      if (config.iceTransportPolicy === 'relay') {
        return console.warn('RTCPeer already with iceTransportPolicy relay only')
      }
      const newConfig: RTCConfiguration = {
        ...config,
        iceTransportPolicy: 'relay',
      }
      this.instance.setConfiguration(newConfig)
      // @ts-ignore
      this.instance.restartIce()
    } catch (error) {
      logger.error('RTCPeer restartIce error', error)
    }
  }

  async applyMediaConstraints(kind: string, constraints: MediaTrackConstraints) {
    try {
      const sender = this._getSenderByKind(kind)
      if (!sender || !sender.track) {
        return logger.info('No sender to apply constraints', kind, constraints)
      }
      if (sender.track.readyState === 'live') {
        logger.info(`Apply ${kind} constraints`, this.options.id, constraints)
        await sender.track.applyConstraints(constraints)
      }
    } catch (error) {
      logger.error('Error applying constraints', kind, constraints)
    }
  }

  private _getSenderByKind(kind: string) {
    return this.instance.getSenders().find(({ track }) => (track && track.kind === kind))
  }

  private _getReceiverByKind(kind: string) {
    return this.instance.getReceivers().find(({ track }) => (track && track.kind === kind))
  }

  async startNegotiation(force = false) {
    if (this._negotiating) {
      return logger.warn('Skip twice onnegotiationneeded!')
    }
    this._negotiating = true
    try {

      if (this.options.secondSource === true) {
        this.instance.getTransceivers().forEach(tr => {
          tr.direction = 'sendonly'
        })
      }

      this.instance.removeEventListener('icecandidate', this._onIce)
      this.instance.addEventListener('icecandidate', this._onIce)

      if (this.isOffer) {
        logger.info('Trying to generate offer')
        const offer = await this.instance.createOffer({ voiceActivityDetection: false })
        await this._setLocalDescription(offer)
      }

      if (this.isAnswer) {
        logger.info('Trying to generate answer')
        await this._setRemoteDescription({ sdp: this.options.remoteSdp, type: PeerType.Offer })
        this._logTransceivers()
        const answer = await this.instance.createAnswer({ voiceActivityDetection: false })
        await this._setLocalDescription(answer)
      }
      if (force) {
        // RN workaroud
        this._sdpReady()
      }
    } catch (error) {
      logger.error(`Error creating ${this.type}:`, error)
    }
  }

  async onRemoteSdp(sdp: string) {
    try {
      const type = this.isOffer ? PeerType.Answer : PeerType.Offer
      await this._setRemoteDescription({ sdp, type })
    } catch (error) {
      logger.error(`Error handling remote SDP on call ${this.options.id}:`, error)
      this.call.hangup()
    }
  }

  private _logTransceivers() {
    logger.info('Number of transceivers:', this.instance.getTransceivers().length)
    this.instance.getTransceivers().forEach((tr, index) => {
      logger.info(`>> Transceiver [${index}]:`, tr.mid, tr.direction, tr.stopped)
      logger.info(`>> Sender Params [${index}]:`, JSON.stringify(tr.sender.getParameters(), null, 2))
    })
  }

  private async _init() {
    this.instance = RTCPeerConnection(this.config)

    this.instance.onsignalingstatechange = event => {
      logger.info('signalingState:', this.instance.signalingState)

      switch (this.instance.signalingState) {
        case 'stable':
          // Workaround to skip nested negotiations
          // Chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=740501
          this._negotiating = false
          break
        case 'closed':
          this.instance = null
          break
        default:
          this._negotiating = true
      }

    }

    this.instance.onnegotiationneeded = event => {
      logger.info('Negotiation needed event')
      this.startNegotiation()
    }

    this.instance.addEventListener('track', (event: RTCTrackEvent) => {
      if (this.hasExperimentalFlag) {
        this._buildMediaElementByTrack(event)
        const notification = { type: 'trackAdd', event }
        this.call._dispatchNotification(notification)
      }

      if (this.isSfu) {
        const notification = { type: 'trackAdd', event }
        this.call._dispatchNotification(notification)
      }
      this.options.remoteStream = event.streams[0]
      const { remoteElement, remoteStream, screenShare } = this.options
      if (screenShare === false) {
        attachMediaStream(remoteElement, remoteStream)
      }
    })

    this.instance.addEventListener('addstream', (event: MediaStreamEvent) => {
      this.options.remoteStream = event.stream
    })

    this.options.localStream = await this._retrieveLocalStream().catch(error => {
      trigger(this.options.id, error, SwEvent.MediaError)
      return null
    })

    const { localElement, localStream = null, screenShare } = this.options
    if (streamIsValid(localStream)) {

      const audioTracks = localStream.getAudioTracks()
      logger.info('Local audio tracks: ', audioTracks)
      const videoTracks = localStream.getVideoTracks()
      logger.info('Local video tracks: ', videoTracks)
      // FIXME: use transceivers way only for offer - when answer gotta match mid from the ones from SRD
      if (this.isOffer && typeof this.instance.addTransceiver === 'function') {
        // Use addTransceiver

        audioTracks.forEach(track => {
          this.options.userVariables.microphoneLabel = track.label
          this.instance.addTransceiver(track, {
            direction: 'sendrecv',
            streams: [ localStream ],
          })
        })

        const transceiverParams: RTCRtpTransceiverInit = {
          direction: 'sendrecv',
          streams: [ localStream ],
        }
        if (this.isSimulcast) {
          const rids = ['0', '1', '2']
          transceiverParams.sendEncodings = rids.map(rid => ({
            active: true,
            rid: rid,
            scaleResolutionDownBy: (Number(rid) * 6 || 1.0),
          }))
        }
        console.debug('Applying video transceiverParams', transceiverParams)
        videoTracks.forEach(track => {
          this.options.userVariables.cameraLabel = track.label
          this.instance.addTransceiver(track, transceiverParams)
        })

        if (this.isSfu) {
          const { msStreamsNumber = 5 } = this.options
          console.debug('Add ', msStreamsNumber, 'recvonly MS Streams')
          transceiverParams.direction = 'recvonly'
          for (let i = 0; i < Number(msStreamsNumber); i++) {
            this.instance.addTransceiver('video', transceiverParams)
          }
        }

      } else if (typeof this.instance.addTrack === 'function') {
        // Use addTrack

        audioTracks.forEach(track => {
          this.options.userVariables.microphoneLabel = track.label
          this.instance.addTrack(track, localStream)
        })

        videoTracks.forEach(track => {
          this.options.userVariables.cameraLabel = track.label
          this.instance.addTrack(track, localStream)
        })
      } else {
        // Fallback to legacy addStream ..
        // @ts-ignore
        this.instance.addStream(localStream)
      }

      if (screenShare === false) {
        muteMediaElement(localElement)
        attachMediaStream(localElement, localStream)
      }

    }

    if (this.isOffer) {
      if (this.options.negotiateAudio) {
        this._checkMediaToNegotiate('audio')
      }
      if (this.options.negotiateVideo) {
        this._checkMediaToNegotiate('video')
      }
    } else {
      this.startNegotiation()
    }
    this._logTransceivers()
  }

  private _checkMediaToNegotiate(kind: string) {
    // addTransceiver of 'kind' if not present
    const sender = this._getSenderByKind(kind)
    if (!sender) {
      const transceiver = this.instance.addTransceiver(kind)
      console.debug('Add transceiver', kind, transceiver)
    }
  }

  private _sdpReady() {
    clearTimeout(this._iceTimeout)
    this._iceTimeout = null
    const { sdp, type } = this.instance.localDescription
    if (sdp.indexOf('candidate') === -1) {
      logger.info('No candidate - retry \n')
      this.startNegotiation(true)
      return
    }
    logger.info('LOCAL SDP \n', `Type: ${type}`, '\n\n', sdp)
    this.instance.removeEventListener('icecandidate', this._onIce)
    switch (type) {
      case PeerType.Offer:
        if (this.call.active) {
          this.executeUpdateMedia()
        } else {
          this.executeInvite()
        }
        break
      case PeerType.Answer:
        this.executeAnswer()
        break
      default:
        return logger.error(`Unknown SDP type: '${type}' on call ${this.options.id}`)
    }
  }

  executeInvite() {
    this.call.setState(State.Requesting)
    const msg = new Invite({
      ...this.call.messagePayload,
      sdp: this.localSdp,
    })
    return this._execute(msg)
  }

  executeUpdateMedia() {
    const msg = new Modify({
      ...this.call.messagePayload,
      sdp: this.localSdp,
      action: 'updateMedia',
    })
    return this._execute(msg)
  }

  executeAnswer() {
    this.call.setState(State.Answering)
    const params = {
      ...this.call.messagePayload,
      sdp: this.localSdp,
    }
    const msg = this.options.attach === true ? new Attach(params) : new Answer(params)
    return this._execute(msg)
  }

  private async _execute(msg: BaseMessage) {
    try {
      const { node_id = null, sdp = null } = await this.call._execute(msg)
      if (node_id) {
        this.call.nodeId = node_id
      }
      if (sdp !== null) {
        await this._setRemoteDescription({ sdp, type: PeerType.Answer })
      } else {
        const state = this.isOffer ? State.Trying : State.Active
        this.call.setState(state)
      }
    } catch (error) {
      logger.error(`Error sending ${this.type} on call ${this.options.id}:`, error)
      this.call.hangup()
    }
  }

  private _onIce(event: RTCPeerConnectionIceEvent) {
    if (this._iceTimeout === null) {
      this._iceTimeout = setTimeout(() => this._sdpReady(), 1000)
    }
    if (event.candidate) {
      logger.debug('RTCPeer Candidate:', event.candidate)
    } else {
      this._sdpReady()
    }
  }

  private _setLocalDescription(localDescription: RTCSessionDescriptionInit) {
    const { useStereo, googleMaxBitrate, googleMinBitrate, googleStartBitrate } = this.options
    if (useStereo) {
      localDescription.sdp = sdpStereoHack(localDescription.sdp)
    }
    if (googleMaxBitrate && googleMinBitrate && googleStartBitrate) {
      localDescription.sdp = sdpBitrateHack(localDescription.sdp, googleMaxBitrate, googleMinBitrate, googleStartBitrate)
    }

    logger.info('LOCAL SDP \n', `Type: ${localDescription.type}`, '\n\n', localDescription.sdp)
    return this.instance.setLocalDescription(localDescription)
  }

  private _setRemoteDescription(remoteDescription: RTCSessionDescriptionInit) {
    if (this.options.useStereo) {
      remoteDescription.sdp = sdpStereoHack(remoteDescription.sdp)
    }
    if (this.instance.localDescription) {
      remoteDescription.sdp = sdpMediaOrderHack(remoteDescription.sdp, this.instance.localDescription.sdp)
    }
    const sessionDescr: RTCSessionDescription = sdpToJsonHack(remoteDescription)
    logger.info('REMOTE SDP \n', `Type: ${remoteDescription.type}`, '\n\n', remoteDescription.sdp)
    return this.instance.setRemoteDescription(sessionDescr)
  }

  private async _retrieveLocalStream() {
    if (streamIsValid(this.options.localStream)) {
      return this.options.localStream
    }
    const constraints = await getMediaConstraints(this.options)
    return getUserMedia(constraints)
  }

  private _buildMediaElementByTrack(event: RTCTrackEvent) {
    console.debug('_buildMediaElementByTrack', event.track.kind, event.track.id, event.streams, event)
    const streamIds = event.streams.map(stream => stream.id)
    switch (event.track.kind) {
      case 'audio': {
        const audio = buildAudioElementByTrack(event.track, streamIds)
        if (this.options.speakerId) {
          try {
            // @ts-ignore
            audio.setSinkId(this.options.speakerId)
          } catch (error) {
            console.debug('setSinkId not supported', this.options.speakerId)
          }
        }
        this.call.audioElements.push(audio)
        break
      }
      case 'video':
        this.call.videoElements.push(buildVideoElementByTrack(event.track, streamIds))
        break
    }
  }
}
