import logger from '../util/logger'
import { getUserMedia, getMediaConstraints, sdpStereoHack, sdpBitrateHack, sdpSimulcastHack, sdpAudioVideoOrderHack, sdpAudioRemoveRidMidExtHack } from './helpers'
import { SwEvent } from '../util/constants'
import { PeerType, State } from './constants'
import WebRTCCall from './WebRTCCall'
import { attachMediaStream, muteMediaElement, sdpToJsonHack, RTCPeerConnection, streamIsValid } from '../util/webrtc'
import { CallOptions } from './interfaces'
import { trigger } from '../services/Handler'
import { Invite, Attach, Answer, Modify } from '../messages/Verto'
import { findElementByType } from '../util/helpers'

logger.enableAll()

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
    console.debug('Sender Params', index, '\n', JSON.stringify(transceiver.sender.getParameters(), null, 2), '\n')
  }

  async startNegotiation() {
    if (this._negotiating) {
      return logger.warn('Skip twice onnegotiationneeded!')
    }
    this._negotiating = true
    try {
      this.instance.removeEventListener('icecandidate', this._onIce)
      this.instance.addEventListener('icecandidate', this._onIce)

      // this._simulcastAddTransceiver()

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
        this._logMSSenderParams('2')
        this._setVideoSenderEncodings()
        this._logMSSenderParams('3')
        const answer = await this.instance.createAnswer({ voiceActivityDetection: false })
        this._logMSSenderParams('4')
        await this._setLocalDescription(answer)
        this._logMSSenderParams('5')
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
      logger.info(`>> Transceiver ${index}:`, tr.mid, tr.direction, tr.stopped)
      // logger.info(`>> Sender ${index}:`, 'Send:', tr.sender.track.kind, 'Recv:', tr.receiver.track.kind)
      logger.info(`>> Sender Params ${index}:`, '\n', tr.sender.getParameters())
    })
  }

  private async _setVideoSenderEncodings() {
    const sender = this._getSenderByKind('video')
    if (!sender) {
      return logger.info('No video sender..')
    }
    const rids = ['0', '1', '2']
    const params = sender.getParameters();
    logger.info(`>> Params Sender:`, '\n', params)
    // @ts-ignore
    params.encodings  = [
      { rid: rids[0], active: true, scaleResolutionDownBy: 1.0 },
      { rid: rids[1], active: true, scaleResolutionDownBy: 6.0 },
      { rid: rids[2], active: true, scaleResolutionDownBy: 12.0 },
    ]
    logger.info(`>> Munge Sender With:`, '\n', params)
    // @ts-ignore
    await sender.setParameters(params);

    logger.info(`>> Munge Video Sender:`, '\n', sender, sender.getParameters())
  }

  private _simulcastAddTransceiver() {
    if (!this.isSimulcast) {
      return logger.warn('Not a simulcast call')
    }

    const rids = ['0', '1', '2']
    const { localStream } = this.options
    localStream.getTracks().forEach(track => {
      if (track.kind === 'audio') {

        logger.info('Add Audio Track')
        this.instance.addTrack(track, localStream)

      } else if (track.kind === 'video') {

        logger.info('Add Video Transceivers!')
        this.instance.addTransceiver(track, {
          direction: 'sendrecv',
          streams: [
            localStream
          ],
          sendEncodings: [
            {
              rid: rids[0],
              active: true,
              // scaleResolutionDownBy: 1.0,
            },
            {
              rid: rids[1],
              active: true,
              // scaleResolutionDownBy: 2,
              scaleResolutionDownBy: 6.0,
            },
            {
              rid: rids[2],
              active: true,
              // scaleResolutionDownBy: 4,
              scaleResolutionDownBy: 12.0,
            }
          ]
        })

      }
    })

    this._logTransceivers()


    // let stream = this.options.localStream

    // if (stream) {

    //         let t = this.instance.getTransceivers()

    //         if (t.length == 0) {

    //             console.log("ADDING TRANSCEIVERS")

    //             // Audio transceiver
    //             if (stream.getAudioTracks()[0]) {

    //                 console.log("ADDING AUDIO TRANSCEIVER")
    //                 this.instance.addTransceiver(stream.getAudioTracks()[0], { streams: [stream] })
    //             }

    //             console.log("ADDING VIDEO TRANSCEIVER")

    //             // Video transceiver
    //             this.instance.addTransceiver(stream.getVideoTracks()[0], {

    //                 streams: [stream],

    //                 //sendEncodings: rids.map(rid => {rid}),
    //                 sendEncodings: [
    //                     {
    //                         rid: rids[0],
    //                         scaleResolutionDownBy: 1.0
    //                     },
    //                     {
    //                         rid: rids[1],
    //                         scaleResolutionDownBy: 6.0
    //                     },
    //                     {
    //                         rid: rids[2],
    //                         scaleResolutionDownBy: 12.0
    //                     }
    //                 ]
    //             })
    //         } else {
    //             // There are some transceivers
    //             console.log("SKIP ADDING TRANSCEIVERS")
    //         }
    //     }

    // console.log("After addTransceiver")
    // t = pc.getTransceivers()
    // console.log(t)

    // let i = 0
    // t.forEach( t => {
    //     let sender = t.sender
    //     if (sender) {
    //         console.log("Sender[" + i + "]:")
    //         console.log(sender)
    //         console.log("Sender[" + i + "] parameters:")
    //         console.log(sender.getParameters())
    //         i++
    //     }
    // })
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
      // This check is valid for simulcast calls AND the legs attached from FS (with verto.attach)
      if (this.isSimulcast) {
        // logger.debug('++++++ ontrack event ++++++')
        // logger.debug('Track:', event.track.id, event.track)
        // logger.debug('Stream:', event.streams[0].id, event.streams[0])
        const notification = { type: 'trackAdd', event }
        this.call._dispatchNotification(notification)
        // logger.debug('++++++ ontrack event ends ++++++')
      }
      this.options.remoteStream = event.streams[0]
      const { remoteStream, screenShare } = this.options
      let remoteElement = this.options.remoteElement

      /**
      // Alternative version
      if (this.isSimulcast) {
        logger.debug('++++++ ontrack alt event ++++++')
        logger.debug('Track:', event.track.id, event.track)
        logger.debug('Stream:', event.streams[0].id, event.streams[0])
        const notification = { type: 'alternativeTrackAdd', event }
        this.call._dispatchNotification(notification)
        logger.debug('++++++ ontrack alt event ends ++++++')
      }
      **/

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

    // if (this.isSimulcast) {

    //     let pc = this.instance
    //     console.log("Transceivers")
    //     var t = pc.getTransceivers()
    //     console.log(t)

    //     let i = 0
    //     t.forEach( t => {
    //         let sender = t.sender
    //         if (sender) {
    //             console.log("Sender[" + i + "]:")
    //             console.log(sender)
    //             console.log("Sender[" + i + "] parameters:")
    //             console.log(sender.getParameters())
    //             i++
    //         }
    //     })
    // }

    const { localElement, localStream = null, screenShare } = this.options
    if (streamIsValid(localStream)) {
      if (typeof this.instance.addTrack === 'function') {

        // if (this.isSimulcast) {

        //   this._simulcastAddTransceiver()

        // } else {

          const audioTracks = localStream.getAudioTracks()
          logger.info('Local audio tracks: ', audioTracks)
          audioTracks.forEach(t => this.instance.addTrack(t, localStream))

          const videoTracks = localStream.getVideoTracks()
          logger.info('Local video tracks: ', videoTracks)
          videoTracks.forEach(t => this.instance.addTrack(t, localStream))
        // }


      } else {
        // @ts-ignore
        this.instance.addStream(localStream)
      }
      if (screenShare === false) {
        muteMediaElement(localElement)
        attachMediaStream(localElement, localStream)
        // this.startNegotiation()
      }
    } else if (localStream === null) {
      this.startNegotiation()
    }
  }

  private async _sdpReady() {
    clearTimeout(this._iceTimeout)
    const { sdp, type } = this.instance.localDescription
    logger.info('LOCAL SDP WITH ICE \n', `Type: ${type}`, '\n\n', sdp)
    if (sdp.indexOf('candidate') === -1) {
      this.startNegotiation()
      return
    }

    if (this.isSimulcast) {
        //this._forceSimulcast()
        // SIMULCAST Skip forcing
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
    // const { useStereo, googleMaxBitrate, googleMinBitrate, googleStartBitrate } = this.options
    // if (useStereo) {
    //   localDescription.sdp = sdpStereoHack(localDescription.sdp)
    // }
    // if (googleMaxBitrate && googleMinBitrate && googleStartBitrate) {
    //   localDescription.sdp = sdpBitrateHack(localDescription.sdp, googleMaxBitrate, googleMinBitrate, googleStartBitrate)
    // }

    // // CHECK: Hack SDP only for offer ?
    // if (this.isSimulcast) {

    //     if (localDescription.type === PeerType.Offer) {

    //         logger.info("Exec sdpAudioVideoOrderHack")
    //         localDescription.sdp = sdpAudioVideoOrderHack(localDescription.sdp)
    //         logger.info("After sdpAudioVideoOrderHack:\n", localDescription.sdp)

    //         // SIMULCAST Seem right to remove MID/RID from audio, though apparently this is not the main reason behind zero RTP extensions...

    //         logger.info("Exec sdpAudioSimulcastRemoveRidMidExtHack")
    //         //localDescription.sdp = sdpAudioRemoveRidMidExtHack(localDescription.sdp)
    //         logger.info("After sdpAudioSimulcastRemoveRidMidExtHack:\n", localDescription.sdp)

    //     } else {
    //         // SIMULCAST Skip simulcast hack when setting local description, nothing to be done here, instead Transceiver is added for media from getUserMedia
    //         logger.info("SIMULCAST answer, skip _setLocalDescription ?")

    //         // const endOfLine = '\r\n'
    //         // const sdp = localDescription.sdp.split(endOfLine)
    //         // let i = sdp.findIndex(element => element.includes("a=group:BUNDLE"))
    //         // sdp[i] = "a=group:BUNDLE 0 1"
    //         // localDescription.sdp = sdp.join(endOfLine)
    //         //return
    //     }
    // }

    // logger.info('>>>> _setLocalDescription', localDescription)
    // logger.info(">>>> sdp: ", localDescription.sdp)
    logger.info('LOCAL SDP \n', `Type: ${localDescription.type}`, '\n\n', localDescription.sdp)
    return this.instance.setLocalDescription(localDescription)
  }

  private _setRemoteDescription(remoteDescription: RTCSessionDescriptionInit) {
    logger.info('REMOTE SDP \n', `Type: ${remoteDescription.type}`, '\n\n', remoteDescription.sdp)
    // if (this.options.useStereo) {
    //   remoteDescription.sdp = sdpStereoHack(remoteDescription.sdp)
    // }
    const sessionDescr: RTCSessionDescription = sdpToJsonHack(remoteDescription)
    // logger.info('>>>> _setRemoteDescription', remoteDescription)
    return this.instance.setRemoteDescription(sessionDescr)
  }

  private async _retrieveLocalStream() {
    if (streamIsValid(this.options.localStream)) {
      return this.options.localStream
    }
    const constraints = await getMediaConstraints(this.options)
    return getUserMedia(constraints)
  }

  private async _forceSimulcast() {
    try {
      const sender = this._getSenderByKind('video')
      if (!sender) {
        logger.debug('Sender video not found!')
        return
      }
      const sendersParams = sender.getParameters()
      if (!sendersParams) {
        logger.debug('No sender parameters!')
        return
      }

      logger.debug('sendersParams', sendersParams)

      /* OK
      p.encodings[0].maxBitrate = 5*1000;
      p.encodings[0].minBitrate = 0;
      p.encodings[1].maxBitrate = 500*1000;
      p.encodings[2].maxBitrate = 0; */
      // debug(p);
      // p.encodings[0].maxBitrate = 20*1000;

      // @ts-ignore
      sendersParams.encodings[0].scaleResolutionDownBy = 8
      // p.encodings[1].maxBitrate = 5*1000;
      // p.encodings[2].maxBitrate = 275*1000;
      // p.encodings[0].minBitrate = 1;
      // p.encodings[1].minBitrate = 1;
      // p.encodings[2].minBitrate = 1;
      /* p.encodings[0].targetBitrate = 1000*1000;
      p.encodings[1].targetBitrate = 1000*1000;
      p.encodings[2].targetBitrate = 1000*1000; */
      await sender.setParameters(sendersParams)

    } catch (error) {
      logger.error('_forceSimulcast error:', error)
    }
  }
}
