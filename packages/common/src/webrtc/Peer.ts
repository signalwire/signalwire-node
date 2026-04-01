import logger from '../util/logger'
import {
  getUserMedia,
  getMediaConstraints,
  sdpStereoHack,
  sdpBitrateHack,
} from './helpers'
import { SwEvent } from '../util/constants'
import { PeerType } from './constants'
import {
  attachMediaStream,
  muteMediaElement,
  sdpToJsonHack,
  RTCPeerConnection,
  streamIsValid,
} from './WebRTC'
import { isFunction } from '../util/helpers'
import { CallOptions } from './interfaces'
import { trigger } from '../services/Handler'
import { filterIceServers } from './helpers'
import { sdpHasAudio, sdpHasVideo } from './helpers'

export default class Peer {
  public instance: RTCPeerConnection
  public onSdpReadyTwice: Function = null
  private _constraints: {
    offerToReceiveAudio: boolean
    offerToReceiveVideo: boolean
  }
  private _negotiating: boolean = false

  constructor(public type: PeerType, private options: CallOptions) {
    logger.info('New Peer with type:', this.type, 'Options:', this.options)

    this._constraints = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    }
    this._sdpReady = this._sdpReady.bind(this)
    this._init()
  }

  resetNegotiating() {
    this._negotiating = false
  }

  get isNegotiating() {
    return this._negotiating
  }

  startNegotiation() {
    this._negotiating = true

    if (this._isOffer()) {
      this._createOffer()
    } else {
      this._createAnswer()
    }
  }

  private async _init() {
    this.instance = RTCPeerConnection(this._config())

    this.instance.onsignalingstatechange = (event) => {
      switch (this.instance.signalingState) {
        case 'stable':
          break
        case 'closed':
          this.instance = null
          break
        default:
          this._negotiating = true
      }
    }

    this.instance.onnegotiationneeded = (event) => {
      if (this._negotiating) {
        logger.debug('Skip twice onnegotiationneeded..')
        return
      }
      this.startNegotiation()
    }

    this.options.localStream = await this._retrieveLocalStream().catch(
      (error) => {
        trigger(SwEvent.MediaError, error, this.options.id)
        return null
      },
    )
    const {
      localElement,
      localStream = null,
      screenShare = false,
    } = this.options
    if (streamIsValid(localStream)) {
      if (typeof this.instance.addTrack === 'function') {
        const tracks = localStream.getTracks()
        for (const track of tracks) {
          await this.instance.addTrack(track, localStream)
        }
      } else {
        // @ts-ignore
        this.instance.addStream(localStream)
      }
      if (screenShare !== true) {
        muteMediaElement(localElement)
        attachMediaStream(localElement, localStream)
      }
    } else if (localStream === null) {
      this.startNegotiation()
    }
  }

  private _createOffer() {
    if (!this._isOffer()) {
      return
    }
    // FIXME: Use https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpTransceiver when available (M71)
    this.instance
      .createOffer(this._constraints)
      .then(this._setLocalDescription.bind(this))
      .then(this._sdpReady)
      .catch((error) => logger.error('Peer _createOffer error:', error))
  }

  private _createAnswer() {
    if (!this._isAnswer()) {
      return
    }
    const { remoteSdp, useStereo } = this.options
    const sdp = useStereo ? sdpStereoHack(remoteSdp) : remoteSdp
    const sessionDescr: RTCSessionDescription = sdpToJsonHack({
      sdp,
      type: PeerType.Offer,
    })
    this.instance
      .setRemoteDescription(sessionDescr)
      .then(() => this.instance.createAnswer())
      .then(this._setLocalDescription.bind(this))
      .then(this._sdpReady)
      .catch((error) => logger.error('Peer _createAnswer error:', error))
  }

  private _setLocalDescription(sessionDescription: RTCSessionDescriptionInit) {
    const {
      useStereo,
      googleMaxBitrate,
      googleMinBitrate,
      googleStartBitrate,
    } = this.options
    if (useStereo) {
      sessionDescription.sdp = sdpStereoHack(sessionDescription.sdp)
    }
    if (googleMaxBitrate && googleMinBitrate && googleStartBitrate) {
      sessionDescription.sdp = sdpBitrateHack(
        sessionDescription.sdp,
        googleMaxBitrate,
        googleMinBitrate,
        googleStartBitrate,
      )
    }
    logger.debug(
      'calling setLocalDescription with SDP:',
      sessionDescription.sdp,
    )
    return this.instance.setLocalDescription(sessionDescription)
  }

  /** Workaround for ReactNative: first time SDP has no candidates */
  private _sdpReady(): void {
    if (isFunction(this.onSdpReadyTwice)) {
      this.onSdpReadyTwice(this.instance.localDescription)
    }
  }

  private _getSharedConstraints(localConstraints, sdp: string = '') {
    const localAudio = localConstraints?.audio ?? false
    const remoteAudio = sdp ? sdpHasAudio(sdp) : false
    const localVideo = localConstraints?.video ?? false
    const remoteVideo = sdp ? sdpHasVideo(sdp) : false

    const sharedConstraints = {
      audio: localAudio && remoteAudio,
      video: localVideo && remoteVideo,
    }

    return sharedConstraints
  }

  private async _retrieveLocalStream() {
    if (streamIsValid(this.options.localStream)) {
      return this.options.localStream
    }
    const localConstraints = await getMediaConstraints(this.options)
    let sharedConstraints = localConstraints

    // If the local stream is requested for an answer,
    // then check whether the offer contains audio and/or video
    // and only call getUserMedia with the capabilities that match
    // local constraints with the offer constraints.
    // The most typical scenario is an offer with audio only: we
    // don't want to call getUserMedia with video in this case.
    if (this._isAnswer()) {
      const { remoteSdp, useStereo } = this.options
      const sdp = useStereo ? sdpStereoHack(remoteSdp) : remoteSdp
      const sessionDescr: RTCSessionDescription = sdpToJsonHack({
        sdp,
        type: PeerType.Offer,
      })
      sharedConstraints = this._getSharedConstraints(
        localConstraints,
        sessionDescr.sdp,
      )
    }

    return getUserMedia(sharedConstraints)
  }

  private _isOffer(): boolean {
    return this.type === PeerType.Offer
  }

  private _isAnswer(): boolean {
    return this.type === PeerType.Answer
  }

  private _config(): RTCConfiguration {
    const {
      iceServers = [],
      iceTransportPolicy = 'all',
      disableUdpIceServers = false,
    } = this.options
    const filteredIceServers = filterIceServers(iceServers, {
      disableUdpIceServers,
    })

    const config: RTCConfiguration = {
      iceTransportPolicy,
      // @ts-ignore
      sdpSemantics: 'unified-plan',
      bundlePolicy: 'max-compat',
      iceServers: filteredIceServers,
    }
    logger.info('RTC config', config)
    return config
  }

  private async _getSenderByKind(kind: string) {
    if (this.instance) {
      const senders = await this.instance.getSenders()
      return senders.find(({ track }) => track && track.kind === kind)
    }
  }

  async applyMediaConstraints(
    kind: string,
    constraints: MediaTrackConstraints,
  ) {
    try {
      const sender = await this._getSenderByKind(kind)
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
}
