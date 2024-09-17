import logger from '../util/logger'
import { getUserMedia, getMediaConstraints, sdpStereoHack, sdpBitrateHack } from './helpers'
import { SwEvent } from '../util/constants'
import { PeerType } from './constants'
import { attachMediaStream, muteMediaElement, sdpToJsonHack, RTCPeerConnection, streamIsValid } from '../util/webrtc'
import { isFunction } from '../util/helpers'
import { CallOptions } from './interfaces'
import { trigger } from '../services/Handler'
import { filterIceServers } from './helpers'

export default class Peer {
  public instance: RTCPeerConnection
  public onSdpReadyTwice: Function = null
  private _constraints: { offerToReceiveAudio: boolean, offerToReceiveVideo: boolean }
  private _negotiating: boolean = false

  constructor(public type: PeerType, private options: CallOptions) {
    logger.info('New Peer with type:', this.type, 'Options:', this.options)

    this._constraints = { offerToReceiveAudio: true, offerToReceiveVideo: true }
    this._sdpReady = this._sdpReady.bind(this)
    this._init()
  }

  startNegotiation() {
    console.log('________startNegotiation... - setting _negotiating to true! <---------------------------')
    this._negotiating = true

    if (this._isOffer()) {
      this._createOffer()
    } else {
      console.log('________startNegotiation... - calling _createAnswer() <--------------------------- connection state: ', this.instance.connectionState)
      this._createAnswer()
    }
  }

  private async _init() {
    this.instance = RTCPeerConnection(this._config())

    this.instance.onsignalingstatechange = event => {
      switch (this.instance.signalingState) {
        case 'stable':
          console.log('________onsignalingstatechange ====== (stable) state: ', this.instance.signalingState, ' - setting _negotiating to false.\\\\')
          // Workaround to skip nested negotiations
          // Chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=740501
          this._negotiating = false
          console.log('________onsignalingstatechange ====== (stable) state: ', this.instance.signalingState, ' - negotiating: ', this._negotiating, '////')
          break
        case 'have-remote-offer':
          console.log('________onsignalingstatechange ====== have-remote-offer! setting _negotiating to true... ++++++++++++++++++++++++++')
          // console.log(' - Current local SDP: ', this.instance.currentLocalDescription?.sdp)
          // console.log(' - Current remote SDP: ', this.instance.currentRemoteDescription?.sdp)
          // console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
          this._negotiating = true
          break
          case 'closed':
            this.instance = null
            break
          default:
          console.log('________onsignalingstatechange ====== state: ', this.instance.signalingState, ' negotiating: ', this._negotiating, ' - setting it to true.')
          this._negotiating = true
      }
    }

    this.instance.onnegotiationneeded = event => {
      console.log('________________onnegotiationneeded________________ signalingState: ', this.instance.signalingState)
      if (this._negotiating) {
        logger.debug('Skip twice onnegotiationneeded..')
        console.log('________________onnegotiationneeded_______________negotiating is TRUE, returning___ signalingState: ', this.instance.signalingState)
        return
      }
      console.log('____onnegotiationneeded.... calling startNegotiation! - signalingState: ', this.instance.signalingState)
      this.startNegotiation()
    }

    console.log('___________ calling _retrieveLocalStream ____________________ this.options: ', this.options)
    this.options.localStream = await this._retrieveLocalStream()
      .catch(error => {
        trigger(SwEvent.MediaError, error, this.options.id)
        return null
      })

    const { localElement, localStream = null, screenShare = false } = this.options

    if (streamIsValid(localStream)) {
      console.log('____localStream is VALID!.... signalingState: ', this.instance.signalingState)

      if (typeof this.instance.addTrack === 'function') {
        console.log('____localStream is VALID!....get all the tracks from the stream -  signalingState: ', this.instance.signalingState)
        localStream.getTracks().forEach(t => this.instance.addTrack(t, localStream))
      } else {
        // @ts-ignore
        this.instance.addStream(localStream)
      }

      if (screenShare !== true) {
        muteMediaElement(localElement)
        console.log('____localStream is VALID!....attach localStream as media stream -  signalingState: ', this.instance.signalingState)
        attachMediaStream(localElement, localStream)
      }


    } else if (localStream === null) {
      console.log('____localStream is nulll.... calling startNegotiation! - signalingState: ', this.instance.signalingState)
      this.startNegotiation()
    } else {
      console.log('____localStream is not valid and NOT null.... signaling state: ', this.instance.signalingState, ' connection state: ', this.instance.connectionState)
    }

  }

  private _createOffer() {
    if (!this._isOffer()) {
      return
    }
    // FIXME: Use https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpTransceiver when available (M71)
    this.instance.createOffer(this._constraints)
      .then(this._setLocalDescription.bind(this))
      .then(this._sdpReady)
      .catch(error => logger.error('Peer _createOffer error:', error))
  }

  private _createAnswer() {
    if (!this._isAnswer()) {
      return
    }

    console.log('>>>>>>>>>>>>>> _createAnswer <<<<<<<<<<<<<<<<< signaling state: ', this.instance.signalingState, ' connection state: ', this.instance.connectionState)

    const { remoteSdp, useStereo } = this.options
    const sdp = useStereo ? sdpStereoHack(remoteSdp) : remoteSdp
    const sessionDescr: RTCSessionDescription = sdpToJsonHack({ sdp, type: PeerType.Offer })


    console.log('>>>>>>>>>>>>>> _createAnswer <<<<<<<<<<<<<<<<< remote description: ', sessionDescr.sdp)


    this.instance.setRemoteDescription(sessionDescr)
      .then(() => this.instance.createAnswer())
      .then(this._setLocalDescription.bind(this))
      .then(this._sdpReady)
      .catch(error => logger.error('Peer _createAnswer error:', error))
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

  /** Workaround for ReactNative: first time SDP has no candidates */
  private _sdpReady(): void {
    if (isFunction(this.onSdpReadyTwice)) {
      this.onSdpReadyTwice(this.instance.localDescription)
    }
  }

  private _sdpHasAudio(sdp: string = ''): boolean {
    return /m=audio/.test(sdp)
  }

  private _sdpHasVideo(sdp: string = ''): boolean {
    return /m=video/.test(sdp)
  }

  private _getSharedConstraints(localConstraints, sdp: string = '') {
    const localAudio = localConstraints?.audio ?? false
    const remoteAudio = sdp ? this._sdpHasAudio(sdp) : false
    const localVideo = localConstraints?.video ?? false
    const remoteVideo = sdp ? this._sdpHasVideo(sdp) : false

    const sharedConstraints = {
      audio: localAudio && remoteAudio,
      video: localVideo && remoteVideo
    }

    return sharedConstraints
  }

  private async _retrieveLocalStream() {
    if (streamIsValid(this.options.localStream)) {
      return this.options.localStream
    }
    const localConstraints = await getMediaConstraints(this.options)
    let sharedConstraints = localConstraints

    if (this._isOffer() === false) {
      const { remoteSdp, useStereo } = this.options
      const sdp = useStereo ? sdpStereoHack(remoteSdp) : remoteSdp
      const sessionDescr: RTCSessionDescription = sdpToJsonHack({ sdp, type: PeerType.Offer })
      console.log(']]]]]]]]]]]]]]]]]]]]_____________ _retrieveLocalStream - remote description: ', sessionDescr.sdp)
      sharedConstraints = this._getSharedConstraints(localConstraints, sessionDescr.sdp)
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

    const { iceServers = [], iceTransportPolicy = 'all', disableUdpIceServers = false } = this.options
    const filteredIceServers = filterIceServers(iceServers, {disableUdpIceServers})

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

  private _getSenderByKind(kind: string) {
    if (this.instance) {
      return this.instance.getSenders().find(({ track }) => (track && track.kind === kind))
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
}
