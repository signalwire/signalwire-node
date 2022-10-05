import logger from '../util/logger'
import SDPUtils from 'sdp'
import { getUserMedia, getMediaConstraints } from './helpers'
import { sdpStereoHack, sdpBitrateHack, sdpMediaOrderHack } from './sdpHelpers'
import { PeerType, RTCErrorCode, State } from './constants'
import WebRTCCall from './WebRTCCall'
import { attachMediaStream, muteMediaElement, sdpToJsonHack, RTCPeerConnection, streamIsValid, buildAudioElementByTrack, buildVideoElementByTrack, stopTrack } from '../util/webrtc'
import { CallOptions } from './interfaces'
import { Invite, Attach, Answer, Modify } from '../messages/Verto'
import BaseMessage from '../messages/BaseMessage'

export default class RTCPeer {
  public instance: RTCPeerConnection
  public needResume = false
  private _iceTimeout = null
  private _negotiating = false
  private _restartingIce = false
  private _watchAudioPacketsTimer: ReturnType<typeof setTimeout>
  private _connectionStateTimer: ReturnType<typeof setTimeout>
  private _restartingIceTimer: ReturnType<typeof setTimeout>

  private _resolvePeerStart: (data?: unknown) => void
  private _rejectPeerStart: (error: unknown) => void

  constructor(
    public call: WebRTCCall,
    public type: PeerType,
    private options: CallOptions
  ) {
    logger.info('New Peer with type:', this.type, 'Options:', this.options)

    this._onIce = this._onIce.bind(this)
  }

  get isOffer() {
    return this.type === PeerType.Offer
  }

  get isAnswer() {
    return this.type === PeerType.Answer
  }

  get isSimulcast() {
    const { simulcast } = this.options
    return Array.isArray(simulcast) || simulcast === true
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

  get hasIceServers() {
    if (this.instance) {
      const { iceServers = [] } = this.instance.getConfiguration()
      return Boolean(iceServers?.length)
    }
    return false
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
      logger.debug('Set iceTransportPolicy to "relay"')
      const config = this.instance.getConfiguration()
      const newConfig: RTCConfiguration = {
        ...config,
        iceTransportPolicy: 'relay',
      }
      this.instance.setConfiguration(newConfig)
      this.restartIce()
    } catch (error) {
      logger.error('RTCPeer restartIce error', error)
    }
  }

  restartIce() {
    if (this._negotiating || this._restartingIce) {
      logger.warn('Skip restartIce')
    }
    this._restartingIce = true

    logger.debug('Restart ICE')
    // Type must be Offer to send reinvite.
    this.type = PeerType.Offer
    // @ts-ignore
    this.instance.restartIce()

    this.clearRestartingIceTimer()
    this._restartingIceTimer = setTimeout(() => {
      this._restartingIce = false
    }, this.options.watchAudioPacketsTimeout * 2)
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
    if (this.instance) {
      return this.instance.getSenders().find(({ track }) => (track && track.kind === kind))
    }
  }

  private _getReceiverByKind(kind: string) {
    if (this.instance) {
      return this.instance.getReceivers().find(({ track }) => (track && track.kind === kind))
    }
  }

  async startNegotiation(force = false) {
    if (this._negotiating || this._restartingIce) {
      return logger.warn('Skip twice onnegotiationneeded!')
    }
    this._negotiating = true
    try {

      if (this.options.screenShare === true || this.options.secondSource === true) {
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
        // this._logTransceivers()
        const answer = await this.instance.createAnswer({ voiceActivityDetection: false })
        await this._setLocalDescription(answer)
      }
      if (force) {
        // RN workaroud
        this._sdpReady()
      }

      logger.info('iceGatheringState', this.instance.iceGatheringState)
      if (this.instance.iceGatheringState === 'gathering') {
        this._iceTimeout = setTimeout(() => {
          this._onIceTimeout()
        }, this.options.maxIceGatheringTimeout)
      }

    } catch (error) {
      logger.error(`Error creating ${this.type}:`, error)
    }
  }

  async onRemoteSdp(sdp: string) {
    try {
      const type = this.isOffer ? PeerType.Answer : PeerType.Offer
      await this._setRemoteDescription({ sdp, type })

      /**
       * Resolve the start() method only for Offer
       * because for Answer we need to reply to FS
       * and wait for the success signaling
       */
      if (this.isOffer) {
        this._resolvePeerStart()
      }

      this.resetNeedResume()
    } catch (error) {
      logger.error(`Error handling remote SDP on call ${this.options.id}:`, error)
      this.call.hangupError = error
      this.call.hangup()
      this._rejectPeerStart(error)
    }
  }

  // private _logTransceivers() {
  //   logger.info('Number of transceivers:', this.instance.getTransceivers().length)
  //   this.instance.getTransceivers().forEach((tr, index) => {
  //     logger.info(`>> Transceiver [${index}]:`, tr.mid, tr.direction, tr.stopped)
  //     logger.info(`>> Sender Params [${index}]:`, JSON.stringify(tr.sender.getParameters(), null, 2))
  //   })
  // }

  triggerResume() {
    if (this.needResume) {
      logger.info('[skipped] Already in "resume" state')
      return
    }
    logger.info('Probably half-open so force close from client')
    this.clearTimers()
    this.needResume = true
    // @ts-ignore
    this.call.session._closeConnection()
  }

  private clearTimers() {
    this.clearWatchAudioPacketsTimer()
    this.clearconnectionStateTimer()
    this.clearRestartingIceTimer()
  }

  private clearRestartingIceTimer() {
    clearTimeout(this._restartingIceTimer)
    this._restartingIce = false
  }

  private clearconnectionStateTimer() {
    clearTimeout(this._connectionStateTimer)
  }

  private clearWatchAudioPacketsTimer() {
    clearTimeout(this._watchAudioPacketsTimer)
  }

  private watchAudioPackets() {
    logger.debug('Start watching audio packets')
    let previousValue = 0

    const meter = async () => {
      let packetsReceived = 0
      try {
        const stats = await this.instance.getStats(null)
        stats.forEach((report) => {
          if (report.type === 'inbound-rtp' && report.kind === 'audio') {
            logger.debug(`inbound-rtp audio:
              packetsReceived: ${report.packetsReceived}
              lastPacketReceivedTimestamp: ${report.lastPacketReceivedTimestamp}
            `)
            packetsReceived = report.packetsReceived
          }
        })
      } catch (error) {
        logger.warn('getStats error', error)
      } finally {
        if (packetsReceived && packetsReceived <= previousValue) {
          logger.warn(`packetsReceived: ${packetsReceived} - previousValue: ${previousValue}`)
          this.triggerResume()
        } else {
          previousValue = packetsReceived ?? previousValue
          this.clearWatchAudioPacketsTimer()
          this._watchAudioPacketsTimer = setTimeout(() => meter(), this.options.watchAudioPacketsTimeout)
        }
      }
    }
    this.clearWatchAudioPacketsTimer()
    meter()
  }

  resetNeedResume() {
    this.needResume = false

    if (this.options.watchAudioPackets && this._getReceiverByKind('audio')) {
      this.watchAudioPackets()
    }
  }

  start() {
    return new Promise(async (resolve, reject) => {

      this._resolvePeerStart = resolve
      this._rejectPeerStart = reject

      this.instance = RTCPeerConnection(this.config)

      this.instance.oniceconnectionstatechange = () => {
        logger.info('iceConnectionState:', this.instance.iceConnectionState)
      }

      this.instance.onicegatheringstatechange = () => {
        logger.info('iceGatheringState:', this.instance.iceGatheringState)
      }

      this.instance.onsignalingstatechange = () => {
        logger.info('signalingState:', this.instance.signalingState)

        switch (this.instance.signalingState) {
          case 'stable':
            // Workaround to skip nested negotiations
            // Chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=740501
            this._negotiating = false
            this.resetNeedResume()
            break
          case 'closed':
            this.instance = null
            break
          default:
            this._negotiating = true
        }
      }

      this.instance.addEventListener('connectionstatechange', (event) => {
        logger.info('connectionState:', this.instance.connectionState)
        switch (this.instance.connectionState) {
          // case 'new':
          //   break
          case 'connecting':
            this._connectionStateTimer = setTimeout(() => {
              logger.warn('connectionState timed out')
              this.restartIceWithRelayOnly()
            }, this.options.maxConnectionStateTimeout)
            break
          case 'connected':
            this.clearconnectionStateTimer()
            this.call.setState(State.Active)
            break
          // case 'closed':
          //   break
          case 'disconnected':
          case 'failed': {
            this.triggerResume()
            break
          }
        }
      }, false)

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

      // @ts-expect-error
      this.instance.addEventListener('addstream', (event: MediaStreamEvent) => {
        this.options.remoteStream = event.stream
      })

      try {
        this.options.localStream = await this._retrieveLocalStream()
      } catch (error) {
        // trigger(this.options.id, error, SwEvent.MediaError)
        const errorObj = new Error(RTCErrorCode.DeviceError)
        // @ts-ignore
        errorObj.details = error
        this.call.hangupError = errorObj
        this._rejectPeerStart(this.call.hangupError)
        return this.call.setState(State.Hangup)
      }

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
            const rids = Array.isArray(this.options.simulcast) ? this.options.simulcast : [1, 4, 0]
            transceiverParams.sendEncodings = rids
              .filter(rid => Number(rid) >= 1)
              .map((rid, index) => ({
                active: true,
                rid: String(index),
                scaleResolutionDownBy: Number(rid),
              }))
          }
          // console.debug('Applying video transceiverParams', transceiverParams)
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

    })
  }

  stop() {
    if (this.instance) {
      this.instance.close()
      this.instance = null
    }
    this.clearTimers()

    this.call.hangupError = new Error(RTCErrorCode.IncompatibleDestination)
    this._rejectPeerStart(this.call.hangupError)
  }

  private _checkMediaToNegotiate(kind: string) {
    // addTransceiver of 'kind' if not present
    const sender = this._getSenderByKind(kind)
    if (!sender) {
      const transceiver = this.instance.addTransceiver(kind)
      console.debug('Add transceiver', kind, transceiver)
    }
  }

  private _sdpIsValid() {
    try {
      if (this.hasIceServers) {
        // check for srflx, prflx and relay candidates
        const regex = /typ (?:srflx|prflx|relay)/
        const sections = SDPUtils.getMediaSections(this.localSdp)
        for (const section of sections) {
          const lines = SDPUtils.splitLines(section)
          const valid = lines.some(line => {
            return line.indexOf('a=candidate') === 0 && regex.test(line)
          })
          if (!valid) {
            return false
          }
        }
      }

      return true
    } catch (error) {
      logger.error('Error checking SDP', error)
      return false
    }
  }

  private _forceNegotiation() {
    logger.info('Force negotiation again')
    this._negotiating = false
    this.startNegotiation()
  }

  private async _sdpReady() {
    clearTimeout(this._iceTimeout)
    this._iceTimeout = null

    const { sdp, type } = this.instance.localDescription
    if (sdp.indexOf('candidate') === -1) {
      logger.info('No candidate - retry \n')
      this.startNegotiation(true)
      return
    }

    if (!this._sdpIsValid()) {
      logger.info('SDP ready but not valid')
      this._onIceTimeout()
      return
    }

    logger.info('LOCAL SDP \n', `Type: ${type}`, '\n\n', sdp)
    try {
      switch (type) {
        case PeerType.Offer:
          // if (this.instance.connectionState === 'new') {
          if (!this.instance.remoteDescription) {
            await this.executeInvite()
          } else {
            await this.executeUpdateMedia()
          }
          break
        case PeerType.Answer: {
          await this.executeAnswer()
          this._resolvePeerStart()
        }
          break
        default:
          throw new Error(`Unknown SDP type: '${type}' on call ${this.options.id}`)
      }
    } catch (error) {
      this.call.hangupError = error
      this._rejectPeerStart(this.call.hangupError)
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

  private _onIceTimeout() {
    if (this._sdpIsValid()) {
      return this._sdpReady()
    }
    const config = this.instance.getConfiguration()
    if (config.iceTransportPolicy === 'relay') {
      logger.info('RTCPeer already with `iceTransportPolicy: relay`')
      this.call.hangupError = new Error(RTCErrorCode.IceGatheringFailed)
      this._rejectPeerStart(this.call.hangupError)
      this.call.setState(State.Destroy)
      return
    }
    this.instance.setConfiguration({
      ...config,
      iceTransportPolicy: 'relay',
    })

    this._forceNegotiation()
  }

  private _onIce(event: RTCPeerConnectionIceEvent) {
    /**
     * Clear _iceTimeout on each single candidate
     */
    if (this._iceTimeout) {
      clearTimeout(this._iceTimeout)
      this._iceTimeout = null
    }

    /**
     * Following spec: no candidate means the
     * gathering is completed.
     */
    if (!event.candidate) {
      this.instance.removeEventListener('icecandidate', this._onIce)
      this._sdpReady()
      return
    }

    logger.info('RTCPeer Candidate:', event.candidate)
    if (event.candidate.type === 'host') {
      /**
       * With `host` candidate set timeout to
       * maxIceGatheringTimeout and then invoke
       * _onIceTimeout to check if the SDP is valid
       */
      this._iceTimeout = setTimeout(() => {
        this.instance.removeEventListener('icecandidate', this._onIce)
        this._onIceTimeout()
      }, this.options.maxIceGatheringTimeout)
    } else {
      /**
       * With `srflx`, `prflx` or `relay` candidates
       * set timeout to iceGatheringTimeout and then invoke
       * _sdpReady since at least one candidate is valid.
       */
      this._iceTimeout = setTimeout(() => {
        this.instance.removeEventListener('icecandidate', this._onIce)
        this._sdpReady()
      }, this.options.iceGatheringTimeout)
    }
  }

  private _setLocalDescription(localDescription: RTCSessionDescriptionInit) {
    const { useStereo, googleMaxBitrate, googleMinBitrate, googleStartBitrate } = this.options
    localDescription.sdp = sdpStereoHack(localDescription.sdp, useStereo)
    if (googleMaxBitrate && googleMinBitrate && googleStartBitrate) {
      localDescription.sdp = sdpBitrateHack(localDescription.sdp, googleMaxBitrate, googleMinBitrate, googleStartBitrate)
    }

    if (this.isAnswer) {
      logger.info('LOCAL SDP \n', `Type: ${localDescription.type}`, '\n\n', localDescription.sdp)
    }
    return this.instance.setLocalDescription(localDescription)
  }

  private _setRemoteDescription(remoteDescription: RTCSessionDescriptionInit) {
    const { useStereo } = this.options
    remoteDescription.sdp = sdpStereoHack(remoteDescription.sdp, useStereo)
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
    // console.debug('_buildMediaElementByTrack', event.track.kind, event.track.id, event.streams, event)
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
