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

  async startNegotiation() {
    try {
      this.instance.removeEventListener('icecandidate', this._onIce)
      this.instance.addEventListener('icecandidate', this._onIce)
      if (this.isOffer) {
        logger.info('Trying to generate offer')
        const offer = await this.instance.createOffer({ voiceActivityDetection: false })
        await this._setLocalDescription(offer)
        return
      }

      if (this.isAnswer) {
        logger.info('Trying to generate answer')
        await this._setRemoteDescription({ sdp: this.options.remoteSdp, type: PeerType.Offer })
        const answer = await this.instance.createAnswer({ voiceActivityDetection: false })
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
      logger.info('signalingState:', this.instance.signalingState)
    }

    this.instance.onnegotiationneeded = event => {
      logger.info('Negotiation needed event')
      this.startNegotiation()
    }

    this.instance.addEventListener('track', (event: RTCTrackEvent) => {
      // This check is valid for simulcast calls AND the legs attached from FS (with verto.attach)
      if (this.isSimulcast) {
        logger.debug('++++++ ontrack event ++++++')
        logger.debug('Track:', event.track.id, event.track)
        logger.debug('Stream:', event.streams[0].id, event.streams[0])
        const notification = { type: 'trackAdd', event }
        this.call._dispatchNotification(notification)
        logger.debug('++++++ ontrack event ends ++++++')
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

    if (this.isSimulcast) {

        let pc = this.instance
        console.log("Before addTransceiver")
        var t = pc.getTransceivers()
        console.log(t)
   
        if (t.length > 1) { 
            var sender = t[1].sender
            var params = sender.getParameters()
            console.log("Sender parameters")
            console.log(params)
        }

        const rids = ['0', '1', '2']
        let stream = this.options.localStream

        if (stream) {
        
            // Audio transceiver
            if (stream.getAudioTracks()[0]) {
                this.instance.addTransceiver(stream.getAudioTracks()[0], { streams: [stream] })
            }

            // Video transceiver
            this.instance.addTransceiver(stream.getVideoTracks()[0], {
            
                streams: [stream],

                //sendEncodings: rids.map(rid => {rid}),
                sendEncodings: [
                    {
                        rid: rids[0],
                        scaleResolutionDownBy: 1.0
                    },
                    {
                        rid: rids[1],
                        scaleResolutionDownBy: 6.0
                    },
                    {
                        rid: rids[2],
                        scaleResolutionDownBy: 12.0
                    }
                ]
            })
        }

        console.log("After addTransceiver")
        t = pc.getTransceivers()
        console.log(t)

        let i = 0
        t.forEach( t => {
            let sender = t.sender
            if (sender) {
                console.log("Sender[" + i + "]:")
                console.log(sender)
                console.log("Sender[" + i + "] parameters:")
                console.log(sender.getParameters())
                i++
            }
        })
    }

    const { localElement, localStream = null, screenShare } = this.options
    if (streamIsValid(localStream)) {
      if (typeof this.instance.addTrack === 'function') {
      
        let atracks = localStream.getAudioTracks()
        logger.info('Local audio tracks: ', atracks)
        if (!this.isSimulcast) {
            //this.stopTrackSender('audio')
            atracks.forEach(t => this.instance.addTrack(t, localStream))
            //this.instance.addTrack(atracks[0], localStream)
        }

        let vtracks = localStream.getVideoTracks()
        logger.info('Local video tracks: ', vtracks)
        if (!this.isSimulcast) {
            vtracks.forEach(t => this.instance.addTrack(t, localStream))
        }

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
    logger.info('LOCAL SDP \n', `Type: ${type}`, '\n\n', sdp)
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
    const { useStereo, googleMaxBitrate, googleMinBitrate, googleStartBitrate } = this.options
    if (useStereo) {
      localDescription.sdp = sdpStereoHack(localDescription.sdp)
    }
    if (googleMaxBitrate && googleMinBitrate && googleStartBitrate) {
      localDescription.sdp = sdpBitrateHack(localDescription.sdp, googleMaxBitrate, googleMinBitrate, googleStartBitrate)
    }
    
    // CHECK: Hack SDP only for offer ?
    if (this.isSimulcast) {

        if (localDescription.type === PeerType.Offer) {

            logger.info("Exec sdpAudioVideoOrderHack") 
            localDescription.sdp = sdpAudioVideoOrderHack(localDescription.sdp)
            logger.info("After sdpAudioVideoOrderHack:\n", localDescription.sdp) 

            // SIMULCAST Seem right to remove MID/RID from audio, though apparently this is not the main reason behind zero RTP extensions...

            logger.info("Exec sdpAudioSimulcastRemoveRidMidExtHack") 
            //localDescription.sdp = sdpAudioRemoveRidMidExtHack(localDescription.sdp)
            logger.info("After sdpAudioSimulcastRemoveRidMidExtHack:\n", localDescription.sdp) 
        
        } else {
            // SIMULCAST Skip simulcast hack when setting local description, nothing to be done here, instead Transceiver is added for media from getUserMedia
            logger.info("SIMULCAST answer, skip _setLocalDescription ?")
            
            const endOfLine = '\r\n'
            const sdp = localDescription.sdp.split(endOfLine)
            let i = sdp.findIndex(element => element.includes("a=group:BUNDLE"))
            sdp[i] = "a=group:BUNDLE 0 1"
            localDescription.sdp = sdp.join(endOfLine)
            //return 
        }
    }

    logger.info('>>>> _setLocalDescription', localDescription)
    logger.info(">>>> sdp: ", localDescription.sdp)
    return this.instance.setLocalDescription(localDescription)
  }

  private _setRemoteDescription(remoteDescription: RTCSessionDescriptionInit) {
    logger.info('REMOTE SDP \n', `Type: ${remoteDescription.type}`, '\n\n', remoteDescription.sdp)
    if (this.options.useStereo) {
      remoteDescription.sdp = sdpStereoHack(remoteDescription.sdp)
    }
    const sessionDescr: RTCSessionDescription = sdpToJsonHack(remoteDescription)
    logger.info('>>>> _setRemoteDescription', remoteDescription)
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
