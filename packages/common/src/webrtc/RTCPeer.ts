import logger from '../util/logger'
import { getUserMedia, getMediaConstraints, sdpStereoHack, sdpBitrateHack } from './helpers'
import { SwEvent } from '../util/constants'
import { PeerType, State } from './constants'
import WebRTCCall from './WebRTCCall'
import { attachMediaStream, muteMediaElement, sdpToJsonHack, RTCPeerConnection, streamIsValid } from '../util/webrtc'
import { CallOptions } from './interfaces'
import { trigger } from '../services/Handler'
import { Invite, Attach, Answer } from '../messages/Verto'

export default class RTCPeer {
  public instance: RTCPeerConnection
  private _iceTimeout = null

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

  get config(): RTCConfiguration {
    const { iceServers = [] } = this.options
    const config: RTCConfiguration = { bundlePolicy: 'max-compat', iceServers }
    logger.info('RTC config', config)
    return config
  }

  async startNegotiation() {
    try {
      if (this.isOffer) {
        const offer = await this.instance.createOffer()
        await this._setLocalDescription(offer)
        return
      }

      if (this.isAnswer) {
        await this._setRemoteDescription({ sdp: this.options.remoteSdp, type: PeerType.Offer })
        const answer = await this.instance.createAnswer()
        await this._setLocalDescription(answer)
        return
      }
    } catch (error) {
      logger.error(`Error creating ${this.type}:`, error)
    }
  }

  async onRemoteSdp(sdp: string) {
    try {
      await this._setRemoteDescription({ sdp, type: PeerType.Answer })
      if (this.call.gotEarly) {
        this.call.setState(State.Early)
      }
      if (this.call.gotAnswer) {
        this.call.setState(State.Active)
      }
    } catch (error) {
      logger.error(`Error handling remote SDP on call ${this.options.id}:`, error)
      this.call.hangup()
    }
  }

  private async _init() {
    this.instance = RTCPeerConnection(this.config)

    this.instance.onsignalingstatechange = event => {
      console.log('signalingState:', this.instance.signalingState)
    }

    this.instance.onnegotiationneeded = event => {
      this.startNegotiation()
    }

    this.instance.addEventListener('icecandidate', this._onIce)

    this.instance.addEventListener('track', (event: RTCTrackEvent) => {
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
      trigger(SwEvent.MediaError, error, this.options.id)
      return null
    })
    const { localElement, localStream = null, screenShare } = this.options
    if (streamIsValid(localStream)) {
      if (typeof this.instance.addTrack === 'function') {
        localStream.getAudioTracks().forEach(t => this.instance.addTrack(t, localStream))
        localStream.getVideoTracks().forEach(t => this.instance.addTrack(t, localStream))
      } else {
        // @ts-ignore
        this.instance.addStream(localStream)
      }
      if (screenShare === false) {
        muteMediaElement(localElement)
        attachMediaStream(localElement, localStream)
      }
    } else if (localStream === null) {
      this.startNegotiation()
    }
  }

  private async _sdpReady() {
    clearTimeout(this._iceTimeout)
    const { sdp, type } = this.instance.localDescription
    if (sdp.indexOf('candidate') === -1) {
      this.startNegotiation()
      return
    }
    this.instance.removeEventListener('icecandidate', this._onIce)
    let msg = null
    const tmpParams = { ...this.call.messagePayload, sdp }
    switch (type) {
      case PeerType.Offer:
        this.call.setState(State.Requesting)
        msg = new Invite(tmpParams)
        break
      case PeerType.Answer:
        this.call.setState(State.Answering)
        msg = this.options.attach === true ? new Attach(tmpParams) : new Answer(tmpParams)
        break
      default:
        return logger.error(`Unknown SDP type: '${type}' on call ${this.options.id}`)
    }
    try {
      const response = await this.call._execute(msg)
      const { node_id = null } = response
      this.call.nodeId = node_id
      type === PeerType.Offer ? this.call.setState(State.Trying) : this.call.setState(State.Active)
    } catch (error) {
      logger.error(`Error sending ${type} on call ${this.options.id}:`, error)
      this.call.hangup()
    }
  }

  private _onIce(event: RTCPeerConnectionIceEvent) {
    if (this._iceTimeout === null) {
      this._iceTimeout = setTimeout(() => this._sdpReady(), 1000)
    }
    if (event.candidate) {
      logger.info('RTCPEer Candidate:', event.candidate)
    } else {
      this._sdpReady()
    }
  }

  private _setLocalDescription(sessionDescription: RTCSessionDescriptionInit) {
    const { useStereo, googleMaxBitrate, googleMinBitrate, googleStartBitrate } = this.options
    if (useStereo) {
      sessionDescription.sdp = sdpStereoHack(sessionDescription.sdp)
    }
    if (googleMaxBitrate && googleMinBitrate && googleStartBitrate) {
      sessionDescription.sdp = sdpBitrateHack(sessionDescription.sdp, googleMaxBitrate, googleMinBitrate, googleStartBitrate)
    }
    return this.instance.setLocalDescription(sessionDescription)
  }

  private _setRemoteDescription(sessionDescription: RTCSessionDescriptionInit) {
    let { sdp, type } = sessionDescription
    if (this.options.useStereo) {
      sdp = sdpStereoHack(sdp)
    }
    const sessionDescr: RTCSessionDescription = sdpToJsonHack({ sdp, type })
    return this.instance.setRemoteDescription(sessionDescr)
  }

  private async _retrieveLocalStream() {
    if (streamIsValid(this.options.localStream)) {
      return this.options.localStream
    }
    const constraints = await getMediaConstraints(this.options)
    return getUserMedia(constraints)
  }
}
