import logger from '../util/logger'
import { getUserMedia, getMediaConstraints, sdpStereoHack, sdpBitrateHack, sdpSimulcastHack, sdpAudioVideoOrderHack, sdpAudioRemoveRidMidExtHack } from './helpers'
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

  get config(): RTCConfiguration {
    const { iceServers = [] } = this.options
    const config: RTCConfiguration = { bundlePolicy: 'max-compat', iceServers }
    logger.info('RTC config', config)
    return config
  }

  stopTrackSender(kind: string) {
    try {
      const sender = this._getSenderByKind(kind)
      if (!sender) {
        return logger.info(`These is not a '${kind}' sender to stop.`)
      }
      if (sender.track) {
        sender.track.stop()
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
        return logger.info(`These is not a '${kind}' sender to restore.`)
      }
      if (sender.track && sender.track.readyState !== 'ended') {
        return logger.info(`There is already an active ${kind} track.`)
      }
      const constraints = await getMediaConstraints(this.options)
      const stream = await getUserMedia({ [kind]: constraints[kind] })
      if (streamIsValid(stream)) {
        const newTrack = stream.getTracks().find(t => t.kind === kind)
        sender.replaceTrack(newTrack)
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

  private _logMSSenderParams(index: string) {
    const transceiver = this.instance.getTransceivers().find(tr => tr.mid === '1')
    if (transceiver && transceiver.sender) {
        console.debug('Sender Params', index, '\n', JSON.stringify(transceiver.sender.getParameters(), null, 2), '\n')
    }
  }

  async startNegotiation() {
    if (this._negotiating) {
      return logger.warn('Skip twice onnegotiationneeded!')
    }
    this._negotiating = true
    try {
      this.instance.removeEventListener('icecandidate', this._onIce)
      this.instance.addEventListener('icecandidate', this._onIce)

      if (this.isOffer) {
        logger.info('Trying to generate offer')
        const offer = await this.instance.createOffer({ voiceActivityDetection: false })
        await this._setLocalDescription(offer)
        logger.info('LOCAL SDP 2 \n', `Type: ${this.instance.localDescription.type}`, '\n\n', this.instance.localDescription.sdp)
        return
      }

      if (this.isAnswer) {
        logger.info('Trying to generate answer')
        this._logMSSenderParams('1')
        await this._setRemoteDescription({ sdp: this.options.remoteSdp, type: PeerType.Offer })
        this._logTransceivers()
        const answer = await this.instance.createAnswer({ voiceActivityDetection: false })
        await this._setLocalDescription(answer)
        logger.info('LOCAL SDP 2 \n', `Type: ${this.instance.localDescription.type}`, '\n\n', this.instance.localDescription.sdp)
        return
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
      if (this.isSimulcast) {
        const notification = { type: 'trackAdd', event }
        this.call._dispatchNotification(notification)
      }
      this.options.remoteStream = event.streams[0]
      const { remoteStream, screenShare } = this.options
      let remoteElement = this.options.remoteElement
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

      if (typeof this.instance.addTransceiver === 'function') {
        // Use addTransceiver

        audioTracks.forEach(track => {
          this.instance.addTransceiver(track, {
            direction: 'sendrecv',
            streams: [ localStream ]
          })
        })

        const transceiverParams: RTCRtpTransceiverInit = {
          // direction: 'sendonly',
          streams: [ localStream ]
        }
        const rids = ['0', '1', '2']
        if (this.isSimulcast) {
          transceiverParams.sendEncodings = rids.map(rid => ({
            active: true,
            rid: rid,
            scaleResolutionDownBy: (Number(rid) * 6 || 1.0),
          }))
        }
        console.debug('Applying video transceiverParams', transceiverParams)
        videoTracks.forEach(track => {
          this.instance.addTransceiver(track, transceiverParams)
        })

        if (this.isSimulcast) {
          const { msStreamsNumber = 5 } = this.options
          console.debug('Add ', msStreamsNumber, 'recvonly MS Streams')
          for (let i = 0; i < Number(msStreamsNumber); i++) {
            this.instance.addTransceiver('video', {
              direction: 'recvonly',
              streams: [ localStream ],
              sendEncodings: rids.map(rid => ({
                active: true,
                rid: rid,
                scaleResolutionDownBy: (Number(rid) * 6 || 1.0),
              }))
            })
          }
        }

        this._logTransceivers()
      } else if (typeof this.instance.addTrack === 'function') {
        // Use addTrack

        audioTracks.forEach(track => {
          this.instance.addTrack(track, localStream)
        })

        videoTracks.forEach(track => {
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

    } else if (localStream === null) {
      this.startNegotiation()
    }
  }

  private async _sdpReady() {
    clearTimeout(this._iceTimeout)
    const { sdp, type } = this.instance.localDescription
    console.debug('ICE SDP \n', `Type: ${type}`, '\n\n', sdp)

    if (sdp.indexOf('candidate') === -1) {
      this.startNegotiation()
      return
    }

    this.instance.removeEventListener('icecandidate', this._onIce)
    let msg = null
    const tmpParams = { ...this.call.messagePayload, sdp }
    switch (type) {
      case PeerType.Offer:
        if (this.call.active) {
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
      const { node_id = null, sdp = null } = await this.call._execute(msg)
      if (node_id) {
        this.call.nodeId = node_id
      }
      if (sdp !== null) {
        await this._setRemoteDescription({ sdp, type: PeerType.Answer })
      } else {
        const state = type === PeerType.Offer ? State.Trying : State.Active
        this.call.setState(state)
      }
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
}
