import logger from '../util/logger'
import WebRTCCall from './WebRTCCall'
import { CallOptions } from './interfaces'
import { getDisplayMedia, setMediaElementSinkId } from '../util/webrtc'
import { Notification } from './constants'

export default class Call extends WebRTCCall {

  private _statsInterval: any = null

  async startScreenShare(opts?: CallOptions) {
    // const video = opts ? (opts.video || true) : true
    const { audio = false, video = true } = (opts || {})
    const displayStream: MediaStream = await getDisplayMedia({ audio, video })
    displayStream.getTracks().forEach(t => {
      t.addEventListener('ended', () => {
        if (this.screenShare) {
          this.screenShare.hangup()
        }
      })
    })
    const { remoteCallerName, remoteCallerNumber, callerName, callerNumber, userVariables = {} } = this.options
    const options: CallOptions = {
      screenShare: true,
      recoverCall: false,
      skipLiveArray: true,
      skipNotifications: true,
      localStream: displayStream,
      destinationNumber: this.extension,
      remoteCallerName,
      remoteCallerNumber,
      callerName: `${callerName} (Screen)`,
      callerNumber: `${callerNumber} (Screen)`,
      // Apply the same userVariables adding
      // memberCallId/memberId to let FS know the originator
      userVariables: {
        ...userVariables,
        memberCallId: this.id,
        memberId: this.participantId,
      },
      ...opts
    }
    this.screenShare = new Call(this.session, options)
    this.screenShare.invite()
    return this.screenShare
  }

  stopScreenShare() {
    if (this.screenShare instanceof Call) {
      this.screenShare.hangup()
    }
  }

  async addSecondSource(opts?: CallOptions) {
    const { remoteCallerName, remoteCallerNumber, callerName, callerNumber, userVariables = {} } = this.options
    const options: CallOptions = {
      secondSource: true,
      recoverCall: false,
      skipLiveArray: true,
      skipNotifications: true,
      destinationNumber: this.extension,
      remoteCallerName,
      remoteCallerNumber,
      callerName: `${callerName} (Second Source)`,
      callerNumber: `${callerNumber} (Second Source)`,
      localStream: null,
      // Apply the same userVariables adding
      // memberCallId/memberId to let FS know the originator
      userVariables: {
        ...userVariables,
        memberCallId: this.id,
        memberId: this.participantId,
      },
      ...opts,
    }
    this.secondSource = new Call(this.session, options)
    this.secondSource.invite()
    return this.secondSource
  }

  removeSecondSource() {
    if (this.secondSource instanceof Call) {
      this.secondSource.hangup()
    }
  }

  async setAudioOutDevice(deviceId: string): Promise<boolean> {
    this.options.speakerId = deviceId
    const { remoteElement, speakerId, experimental } = this.options
    if (experimental === true) {
      try {
        // @ts-ignore
        await this.audioElements[0].setSinkId(speakerId)
        this._dispatchNotification({ type: Notification.DeviceUpdated })
      } catch (error) {
        console.error('setAudioOutDevice error', this.audioElements, speakerId)
      }
      return
    }
    return setMediaElementSinkId(remoteElement, speakerId)
  }

  protected _finalize() {
    this._stats(false)

    super._finalize()
  }

  private _stats(what: boolean = true) {
    if (what === false) {
      return clearInterval(this._statsInterval)
    }
    logger.setLevel(2)
    this._statsInterval = window.setInterval(async () => {
      const stats = await this.peer.instance.getStats(null)
      let statsOutput: string = ''
      const invalidReport = ['certificate', 'codec', 'peer-connection', 'stream', 'local-candidate', 'remote-candidate']
      const invalidStat = ['id', 'type', 'timestamp']
      stats.forEach(report => {
        if (invalidReport.includes(report.type)) {
          return
        }
        statsOutput += `\n${report.type}\n`
        Object.keys(report).forEach(statName => {
          if (!invalidStat.includes(statName)) {
            statsOutput += `\t${statName}: ${report[statName]}\n`
          }
        })
      })
      logger.info(statsOutput)
    }, 2000)
  }
}
