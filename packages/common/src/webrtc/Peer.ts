import logger from '../util/logger'
import { getUserMedia, getMediaConstraints, sdpStereoHack, sdpSimulcastHack } from './helpers'
import { PeerType, SwEvent } from '../util/constants'
import { attachMediaStream, muteMediaElement, sdpToJsonHack, RTCPeerConnection, streamIsValid } from '../util/webrtc'
import { isFunction } from '../util/helpers'
import { CallOptions } from '../util/interfaces'
import { trigger } from '../services/Handler'

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

  set audioState(what: boolean | string) {
    this._setTracks(this._audioTracks(), what)
  }

  get audioState() {
    return this._audioTracks().every(t => t.enabled)
  }

  set videoState(what: boolean | string) {
    this._setTracks(this._videoTracks(), what)
  }

  get videoState() {
    return this._videoTracks().every(t => t.enabled)
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

    this.instance.onsignalingstatechange = event => {
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
      if (this._negotiating) {
        logger.debug('Skip twice onnegotiationneeded..')
        return
      }
      this.startNegotiation()
    }

    this.options.localStream = await this._retrieveLocalStream()
      .catch(error => {
        trigger(SwEvent.MediaError, error, this.options.id)
        return null
      })
    const { localElement, localStream = null, screenShare = false } = this.options
    if (streamIsValid(localStream)) {
      if (this.instance.hasOwnProperty('addTrack')) {
        localStream.getTracks().forEach(t => this.instance.addTrack(t, localStream))
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
    this.instance.createOffer(this._constraints)
      .then(this._setLocalDescription.bind(this))
      .then(this._sdpReady)
      .catch(error => logger.error('Peer _createOffer error:', error))
  }

  private _createAnswer() {
    if (!this._isAnswer()) {
      return
    }
    const { remoteSdp, useStereo = true } = this.options
    const sdp = useStereo ? sdpStereoHack(remoteSdp) : remoteSdp
    const sessionDescr: RTCSessionDescription = sdpToJsonHack({ sdp, type: PeerType.Offer })
    this.instance.setRemoteDescription(sessionDescr)
      .then(() => this.instance.createAnswer())
      .then(this._setLocalDescription.bind(this))
      .then(this._sdpReady)
      .catch(error => logger.error('Peer _createAnswer error:', error))
  }

  private _setLocalDescription(sessionDescription: RTCSessionDescriptionInit) {
    if (this.options.useStereo) {
      sessionDescription.sdp = sdpStereoHack(sessionDescription.sdp)
    }
    if (sessionDescription.type === PeerType.Offer) {
      sessionDescription.sdp = sdpSimulcastHack(sessionDescription.sdp)
    }
    return this.instance.setLocalDescription(sessionDescription)
  }

  /** Workaround for ReactNative: first time SDP has no candidates */
  private _sdpReady(): void {
    this._forceSimulcast()
    if (isFunction(this.onSdpReadyTwice)) {
      this.onSdpReadyTwice(this.instance.localDescription)
    }
  }

  private async _retrieveLocalStream() {
    if (streamIsValid(this.options.localStream)) {
      return this.options.localStream
    }
    return getUserMedia(getMediaConstraints(this.options))
  }

  private _isOffer(): boolean {
    return this.type === PeerType.Offer
  }

  private _isAnswer(): boolean {
    return this.type === PeerType.Answer
  }

  private _config(): RTCConfiguration {
    const { iceServers = [] } = this.options
    // @ts-ignore
    // const config: RTCConfiguration = { sdpSemantics: 'plan-b', bundlePolicy: 'max-compat', iceServers }
    const config: RTCConfiguration = { bundlePolicy: 'max-compat', iceServers }
    logger.info('RTC config', config)
    return config
  }

  private _audioTracks() {
    if (!streamIsValid(this.options.localStream)) {
      throw new Error('Invalid Local Stream')
    }
    return this.options.localStream.getAudioTracks()
  }

  private _videoTracks() {
    if (!streamIsValid(this.options.localStream)) {
      throw new Error('Invalid Local Stream')
    }
    return this.options.localStream.getVideoTracks()
  }

  private _setTracks(tracks: MediaStreamTrack[], what: boolean | string) {
    for (let i = 0; i < tracks.length; i++) {
      switch (what) {
        case true:
        case 'on':
          tracks[i].enabled = true
          break
        case false:
        case 'off':
          tracks[i].enabled = false
          break
        case 'toggle':
          tracks[i].enabled = !tracks[i].enabled
          break
      }
    }
  }

  private async _forceSimulcast() {
    try {
      const sender = this.instance.getSenders().find(s => s.track.kind === 'video')
      if (!sender) return
      const sendersParams = sender.getParameters()
      if (!sendersParams) return

      logger.warn('sendersParams', sendersParams)

      /* OK
      p.encodings[0].maxBitrate = 5*1000;
      p.encodings[0].minBitrate = 0;
      p.encodings[1].maxBitrate = 500*1000;
      p.encodings[2].maxBitrate = 0; */
      //debug(p);
      //p.encodings[0].maxBitrate = 20*1000;
      // @ts-ignore
      sendersParams.encodings[0].scaleResolutionDownBy = 8
      //p.encodings[1].maxBitrate = 5*1000;
      //p.encodings[2].maxBitrate = 275*1000;
      //p.encodings[0].minBitrate = 1;
      //p.encodings[1].minBitrate = 1;
      //p.encodings[2].minBitrate = 1;
      /*p.encodings[0].targetBitrate = 1000*1000;
      p.encodings[1].targetBitrate = 1000*1000;
      p.encodings[2].targetBitrate = 1000*1000;*/
      await sender.setParameters(sendersParams)
    } catch (error) {
      logger.error('_forceSimulcast error:', error)
    }
  }
}
