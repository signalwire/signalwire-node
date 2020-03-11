import logger from '../util/logger'
import { getUserMedia, getMediaConstraints, sdpStereoHack, sdpBitrateHack } from './helpers'
import { SwEvent } from '../util/constants'
import { PeerType, State } from './constants'
import WebRTCCall from './WebRTCCall'
import { attachMediaStream, muteMediaElement, sdpToJsonHack, RTCPeerConnection, streamIsValid } from '../util/webrtc'
import { CallOptions } from './interfaces'
import { trigger } from '../services/Handler'
import { Invite, Attach, Answer, Modify } from '../messages/Verto'

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
        console.log('Trying to generate offer')
        const offer = await this.instance.createOffer()
        await this._setLocalDescription(offer)
        return
      }

      if (this.isAnswer) {
        console.log('Trying to generate answer')
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
      console.log('A new negotiation is needed!!')
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
      trigger(this.options.id, error, SwEvent.MediaError)
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
    console.log('LOCAL SDP \n', `Type: ${type}`, '\n\n', sdp)
    if (sdp.indexOf('candidate') === -1) {
      this.startNegotiation()
      return
    }
    // this.instance.removeEventListener('icecandidate', this._onIce)
    let msg = null
    const tmpParams = { ...this.call.messagePayload, sdp }
    //@ts-ignore
    const REINVITE = this.call._state === State.Active
    switch (type) {
      case PeerType.Offer:
        if (REINVITE) {
          console.log('Generate verto.modify request')
          msg = new Modify({ ...this.call.messagePayload, sdp, action: 'updateMedia' })
        } else {
          this.call.setState(State.Requesting)
          msg = new Invite(tmpParams)
        }
        break
      case PeerType.Answer:
        this.call.setState(State.Answering)
        msg = this.options.attach === true ? new Attach(tmpParams) : new Answer(tmpParams)
        break
      default:
        return logger.error(`Unknown SDP type: '${type}' on call ${this.options.id}`)
    }
    try {
      const { node_id = null, sdp } = await this.call._execute(msg)
      this.call.nodeId = node_id
      if (REINVITE) {
        await this._setRemoteDescription({ sdp, type: PeerType.Answer })
        return
      }
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

  private _setLocalDescription(localDescription: RTCSessionDescriptionInit) {
    const { useStereo, googleMaxBitrate, googleMinBitrate, googleStartBitrate } = this.options
    if (useStereo) {
      localDescription.sdp = sdpStereoHack(localDescription.sdp)
    }
    if (googleMaxBitrate && googleMinBitrate && googleStartBitrate) {
      localDescription.sdp = sdpBitrateHack(localDescription.sdp, googleMaxBitrate, googleMinBitrate, googleStartBitrate)
    }
    console.log('>>>> _setLocalDescription', localDescription)
    return this.instance.setLocalDescription(localDescription)
  }

  private _setRemoteDescription(remoteDescription: RTCSessionDescriptionInit) {
    console.log('REMOTE SDP \n', `Type: ${remoteDescription.type}`, '\n\n', remoteDescription.sdp)
    if (this.options.useStereo) {
      remoteDescription.sdp = sdpStereoHack(remoteDescription.sdp)
    }
    const sessionDescr: RTCSessionDescription = sdpToJsonHack(remoteDescription)
    console.log('>>>> _setRemoteDescription', remoteDescription)
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
