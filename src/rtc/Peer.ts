import logger from '../util/logger'
import { getUserMedia, getMediaConstraints, streamIsValid } from '../services/RTCService'
import { PeerType, SwEvent } from '../util/constants'
import { attachMediaStream } from '../util/webrtc'
import { DialogOptions } from '../interfaces/'
import { trigger } from '../services/Handler'

export default class Peer {
  public instance: RTCPeerConnection
  private _constraints: { offerToReceiveAudio: number, offerToReceiveVideo: number }
  private _negotiating: boolean = false

  constructor(public type: PeerType, private options: DialogOptions) {
    logger.info('New Peer with type:', this.type, 'Options:', this.options)

    this._constraints = { offerToReceiveAudio: 1, offerToReceiveVideo: 1 }
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

  private async _init() {
    this.instance = new RTCPeerConnection(this._config())

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
      this._negotiating = true

      if (this._isOffer()) {
        this._createOffer()
      } else {
        this._createAnswer()
      }
    }

    this.options.localStream = await this._retrieveLocalStream()
      .catch(error => {
        trigger(SwEvent.MediaError, error, this.options.id)
      })
    const { localElementId = '', localStream } = this.options
    if (streamIsValid(localStream)) {
      localStream.getTracks().forEach(t => this.instance.addTrack(t, localStream))
      attachMediaStream(localElementId, localStream)
    }
  }

  private async _createOffer() {
    if (!this._isOffer()) {
      return
    }
    // FIXME: Use https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpTransceiver when available (M71)
    // this.instance.createOffer()
    this.instance.createOffer(this._constraints)
      .then(offer => this.instance.setLocalDescription(offer))
      .catch(error => logger.error('Peer _createOffer error:', error))
  }

  private _createAnswer() {
    if (!this._isAnswer()) {
      return
    }
    this.instance.setRemoteDescription({ sdp: this.options.remoteSdp, type: 'offer' })
      .then(() => this.instance.createAnswer())
      .then(answer => this.instance.setLocalDescription(answer))
      .catch(error => logger.error('Peer _createAnswer error:', error))
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
    const config: RTCConfiguration = {}
    if (this.options.hasOwnProperty('iceServers') && this.options.iceServers) {
      if (typeof (this.options.iceServers) === 'boolean') {
        config.iceServers = [{ urls: ['stun:stun.l.google.com:19302'] }]
      } else {
        config.iceServers = this.options.iceServers
      }
    }
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
}
