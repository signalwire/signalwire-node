import logger from '../util/logger'
import { getUserMedia, getMediaConstraints, sdpStereoHack, sdpBitrateHack } from './helpers'
import { SwEvent } from '../util/constants'
import { PeerType } from './constants'
import WebRTCCall from './WebRTCCall'
import { attachMediaStream, muteMediaElement, sdpToJsonHack, RTCPeerConnection, streamIsValid } from '../util/webrtc'
import { CallOptions } from './interfaces'
import { trigger } from '../services/Handler'

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
        const { remoteSdp, useStereo } = this.options
        const sdp = useStereo ? sdpStereoHack(remoteSdp) : remoteSdp
        const sessionDescr: RTCSessionDescription = sdpToJsonHack({ sdp, type: PeerType.Offer })
        await this.instance.setRemoteDescription(sessionDescr)
        const answer = await this.instance.createAnswer()
        await this._setLocalDescription(answer)
        return
      }
    } catch (error) {
      logger.error(`Error creating ${this.type}:`, error)
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

    // TODO: CHECK HERE!
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
    const { sdp } = this.instance.localDescription
    if (sdp.indexOf('candidate') === -1) {
      this.startNegotiation()
      return
    }
    this.instance.removeEventListener('icecandidate', this._onIce)
    console.log('SEND THIS FUCKING SDP!')
    this.call._onLocalSdp()
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

  private async _retrieveLocalStream() {
    if (streamIsValid(this.options.localStream)) {
      return this.options.localStream
    }
    const constraints = await getMediaConstraints(this.options)
    return getUserMedia(constraints)
  }
}
