import logger from '../util/logger'
import BrowserSession from '../BrowserSession'
import { register, deRegisterAll } from '../services/Handler'
import { mutateCanvasInfoData, destructSubscribeResponse } from './helpers'
import { ConferenceAction, Notification } from './constants'
import { VertoPvtData, ICanvasInfo, ICallParticipant } from './interfaces'
import { mutateLiveArrayData } from '../util/helpers'

export default class Conference {

  public participantLogo = ''
  public canvasType: string
  public canvasInfo: ICanvasInfo
  public participantLayerIndex = -1

  private pvtData: VertoPvtData
  private _lastSerno = 0
  private _isVmuted = false
  private _isMuted = false

  constructor(protected session: BrowserSession) {
    this.laChannelHandler = this.laChannelHandler.bind(this)
    this.infoChannelHandler = this.infoChannelHandler.bind(this)
    this.chatChannelHandler = this.chatChannelHandler.bind(this)
    this.modChannelHandler = this.modChannelHandler.bind(this)
  }

  get nodeId() {
    return this.pvtData.nodeId
  }

  get callId() {
    return this.pvtData.callID
  }

  get currentParticipant(): ICallParticipant {
    const participant = {
      id: this.participantId,
      role: this.participantRole,
      layer: null,
      layerIndex: this.participantLayerIndex,
      isLayerBehind: false,
    }
    if (this.canvasInfo && this.participantLayerIndex >= 0) {
      const { layoutOverlap, canvasLayouts } = this.canvasInfo
      participant.layer = canvasLayouts[this.participantLayerIndex]
      participant.isLayerBehind = layoutOverlap && participant.layer.overlap === 0
    }
    return participant
  }

  get participantId() {
    return String(this.pvtData.conferenceMemberID)
  }

  get participantRole() {
    return this.pvtData.role
  }

  get channels() {
    const { laChannel, chatChannel, infoChannel, modChannel } = this.pvtData
    return [laChannel, chatChannel, infoChannel, modChannel].filter(Boolean)
  }

  async join(pvtData: VertoPvtData) {
    this.pvtData = pvtData
    this.session.calls[this.callId].extension = this.pvtData.laName
    await this._subscribe()
    this._dispatchConferenceUpdate({ action: ConferenceAction.Join, conferenceName: this.pvtData.laName, participantId: this.participantId, role: this.participantRole })
  }

  part(pvtData: VertoPvtData) {
    this.pvtData = pvtData
    this._dispatchConferenceUpdate({ action: ConferenceAction.Leave, conferenceName: this.pvtData.laName, participantId: this.participantId, role: this.participantRole })
    return this._unsubscribe()
  }

  destroy() {
    return this._unsubscribe()
  }

  sendChatMessage(message: string, type: string) {
    this.session.vertoBroadcast({ nodeId: this.nodeId, channel: this.pvtData.chatChannel, data: { action: 'send', message, type } })
  }

  listVideoLayouts() {
    this._moderatorCommand({ command: 'list-videoLayouts' })
  }

  playMedia(file: string) {
    this._moderatorCommand({ command: 'play', value: file })
  }

  stopMedia() {
    this._moderatorCommand({ command: 'stop', value: 'all' })
  }

  startRecord(file: string) {
    this._moderatorCommand({ command: 'recording', value: ['start', file] })
  }

  stopRecord() {
    this._moderatorCommand({ command: 'recording', value: ['stop', 'all'] })
  }

  snapshot(file: string) {
    this._moderatorCommand({ command: 'vid-write-png', value: file })
  }

  setVideoLayout(layout: string, canvasID: number) {
    const value = canvasID ? [layout, canvasID] : layout
    this._moderatorCommand({ command: 'vid-layout', value })
  }

  kick(id: string) {
    this._moderatorCommand({ command: 'kick', id })
  }

  muteAudio(participantId?: string) {
    this._moderatorCommand({ command: 'mute', id: participantId || this.participantId })
  }

  unmuteAudio(participantId?: string) {
    this._moderatorCommand({ command: 'unmute', id: participantId || this.participantId })
  }

  toggleAudioMute(participantId?: string) {
    this._moderatorCommand({ command: 'tmute', id: participantId || this.participantId })
  }

  muteVideo(participantId?: string) {
    this._moderatorCommand({ command: 'vmute', id: participantId || this.participantId })
  }

  unmuteVideo(participantId?: string) {
    this._moderatorCommand({ command: 'unvmute', id: participantId || this.participantId })
  }

  toggleVideoMute(participantId?: string) {
    this._moderatorCommand({ command: 'tvmute', id: participantId || this.participantId })
  }

  deaf(participantId?: string) {
    this._moderatorCommand({ command: 'deaf', id: participantId || this.participantId })
  }

  undeaf(participantId?: string) {
    this._moderatorCommand({ command: 'undeaf', id: participantId || this.participantId })
  }

  // TODO: implement toggleDeaf

  presenter(participantId?: string) {
    this._moderatorCommand({ command: 'vid-res-id', id: participantId || this.participantId, value: 'presenter' })
  }

  videoFloor(participantId?: string) {
    this._moderatorCommand({ command: 'vid-floor', id: participantId || this.participantId, value: 'force' })
  }

  banner(text: string, participantId?: string) {
    this._moderatorCommand({ command: 'vid-banner', id: participantId || this.participantId, value: encodeURI(text) })
  }

  volumeDown(participantId?: string) {
    this._moderatorCommand({ command: 'volume_out', id: participantId || this.participantId, value: 'down' })
  }

  volumeUp(participantId?: string) {
    this._moderatorCommand({ command: 'volume_out', id: participantId || this.participantId, value: 'up' })
  }

  gainDown(participantId?: string) {
    this._moderatorCommand({ command: 'volume_in', id: participantId || this.participantId, value: 'down' })
  }

  gainUp(participantId?: string) {
    this._moderatorCommand({ command: 'volume_in', id: participantId || this.participantId, value: 'up' })
  }

  transfer(destination: string, participantId?: string) {
    this._moderatorCommand({ command: 'transfer', id: participantId || this.participantId, value: destination })
  }

  toggleNoiseBlocker(participantId: string, value: string) {
    this._moderatorCommand({ command: 'denoise', id: participantId, value })
  }

  toggleLowBitrateMode(participantId: string, value: string) {
    this._moderatorCommand({ command: 'lowbr', id: participantId, value })
  }

  addToCall(value: string) {
    this._moderatorCommand({ command: 'xdial', value })
  }

  toggleHandRaised(participantId: string, value: string = null) {
    // participantId passed as 'value' instead of 'id'
    this._moderatorCommand({ command: 'handraise', id: participantId, value })
  }

  confQuality(value: string) {
    this._moderatorCommand({ command: 'quality.lua', value })
  }

  confFullscreen(participantId: string, value: string = null) {
    this._moderatorCommand({ command: 'full-screen', id: participantId, value })
  }

  modCommand(command: string, participantId: string = null, value: string = null) {
    this._moderatorCommand({ command, id: participantId, value })
  }

  laChannelHandler({ data: packet }: any) {
    // FIXME: 'reorder' - changepage' - 'heartbeat' methods not implemented
    if (!this._checkSerno(packet.wireSerno)) {
      if (packet.wireSerno === this._lastSerno) {
        return logger.debug('Skip event:', packet.wireSerno, 'last was:', this._lastSerno)
      }
      logger.error('Invalid conference wireSerno:', packet)
      return this._bootstrap()
    }
    const { action, data, hashKey: callId } = packet
    switch (action) {
      case 'bootObj': {
        this._lastSerno = 0
        const participants = []
        for (const i in data) {
          const participant = { callId: data[i][0], ...mutateLiveArrayData(data[i][1]) }
          const { callId, audio, video } = participant
          if (this.callId === callId && audio && video) {
            const call = this.session.calls[this.callId]
            this._isMuted = audio.muted
            if (call && this._isMuted === true) {
              call.stopOutboundAudio()
            }
            this._isVmuted = video.muted
            if (call && this._isVmuted === true) {
              call.stopOutboundVideo()
            }
          }
          participants.push(participant)
        }
        return this._dispatchConferenceUpdate({ action: ConferenceAction.Bootstrap, participants })
      }
      case 'add':
        return this._dispatchConferenceUpdate({ action: ConferenceAction.Add, callId, ...mutateLiveArrayData(data) })
      case 'modify': {
        const notification = { action: ConferenceAction.Modify, callId, ...mutateLiveArrayData(data) }
        if (this.callId === callId) {
          const { audio, video } = notification
          const call = this.session.calls[this.callId]
          if (audio) {
            if (this._isMuted !== audio.muted) {
              audio.muted ? call.stopOutboundAudio() : call.restoreOutboundAudio()
            }
            this._isMuted = audio.muted
          }
          if (video) {
            if (this._isVmuted !== video.muted) {
              video.muted ? call.stopOutboundVideo() : call.restoreOutboundVideo()
            }
            this._isVmuted = video.muted
          }
        }
        return this._dispatchConferenceUpdate(notification)
      }
      case 'del':
        return this._dispatchConferenceUpdate({ action: ConferenceAction.Delete, callId, ...mutateLiveArrayData(data) })
      case 'clear':
        return this._dispatchConferenceUpdate({ action: ConferenceAction.Clear })
      default:
        return this._dispatchConferenceUpdate({ action, data, callId })
    }
  }

  infoChannelHandler(params: any) {
    const { eventData = null } = params
    if (!eventData) {
      return logger.warn('Unknown conference info event', params)
    }
    switch (eventData.contentType) {
      case 'layout-info':
        return this.updateLayouts(eventData)
      case 'conference-info':
        const { contentType, ...rest } = eventData
        return this._dispatchConferenceUpdate({ action: ConferenceAction.ConferenceInfo, ...rest })
      case 'caption-info':
        return this.handleCaptionInfo(eventData)
      default:
        logger.warn('Unknown conference info event', params)
    }
  }

  chatChannelHandler(params: any) {
    const { direction, from: participantNumber, fromDisplay: participantName, message: messageText, type: messageType } = params.data
    this._dispatchConferenceUpdate({ action: ConferenceAction.ChatMessage, direction, participantNumber, participantName, messageText, messageType, messageId: params.eventSerno })
  }

  modChannelHandler(params: any) {
    const { data } = params
    switch (data['conf-command']) {
      case 'list-videoLayouts':
        if (data.responseData) {
          const tmp = JSON.stringify(data.responseData).replace(/IDS"/g, 'Ids"')
          this._dispatchConferenceUpdate({ action: ConferenceAction.LayoutList, layouts: JSON.parse(tmp) })
        }
        break
      default:
        this._dispatchConferenceUpdate({ action: ConferenceAction.ModCmdResponse, command: data['conf-command'], response: data.response })
    }
  }

  updateLayouts(params: any) {
    const { contentType, callID, canvasType, canvasInfo = null, currentLayerIdx = -1, ...rest } = params
    this.canvasType = canvasType
    this.participantLayerIndex = currentLayerIdx
    if (canvasInfo !== null) {
      this.canvasInfo = mutateCanvasInfoData(canvasInfo)
    }
    this._dispatchConferenceUpdate({ action: ConferenceAction.LayoutInfo, participant: this.currentParticipant, canvasInfo: this.canvasInfo, ...rest })
  }

  updateLogo(params: any) {
    const { logoURL: logo } = params
    this.participantLogo = logo
    this._dispatchConferenceUpdate({ action: ConferenceAction.LogoInfo, logo })
  }

  handleCaptionInfo(params: any) {
    const { contentType, ...rest } = params
    this._dispatchConferenceUpdate({ action: ConferenceAction.CaptionInfo, ...rest })
  }

  private _bootstrap() {
    const { laName, laChannel } = this.pvtData
    const data = { liveArray: { command: 'bootstrap', context: laChannel, name: laName } }
    this.session.vertoBroadcast({ nodeId: this.nodeId, channel: laChannel, data })
  }

  private _moderatorCommand(params: any = {}) {
    const { role, modChannel } = this.pvtData
    if (role !== 'moderator' || !modChannel) {
      return logger.warn('You are not a moderator for this conference.')
    }
    const data = {
      application: 'conf-control',
      callID: this.callId,
      ...params
    }
    this.session.vertoBroadcast({ nodeId: this.nodeId, channel: modChannel, data })
  }

  private async _subscribe() {
    const { laChannel, chatChannel, infoChannel, modChannel } = this.pvtData
    const params = {
      nodeId: this.nodeId,
      channels: this.channels
    }
    try {
      const result = await this.session.vertoSubscribe(params)
      const { subscribed = [], alreadySubscribed = [] } = destructSubscribeResponse(result)
      const all = subscribed.concat(alreadySubscribed)
      this.channels.forEach(deRegisterAll)
      if (all.includes(laChannel)) {
        register(laChannel, this.laChannelHandler)
        this._bootstrap()
      }
      if (all.includes(chatChannel)) {
        register(chatChannel, this.chatChannelHandler)
      }
      if (all.includes(infoChannel)) {
        register(infoChannel, this.infoChannelHandler)
      }
      if (all.includes(modChannel)) {
        register(modChannel, this.modChannelHandler)
      }
    } catch (error) {
      logger.error('Conference subscriptions error:', error)
    }
  }

  private async _unsubscribe() {
    this.channels.forEach(deRegisterAll)
    const params = {
      nodeId: this.nodeId,
      channels: this.channels
    }
    try {
      await this.session.vertoUnsubscribe(params)
    } catch (error) {
      logger.error('Conference unsubscribe error:', error)
    }
    this._lastSerno = 0
  }

  private _dispatchConferenceUpdate(params: any) {
    const call = this.session.calls[this.callId]
    if (call) {
      call._dispatchNotification({ type: Notification.ConferenceUpdate, ...params })
    }
  }

  private _checkSerno = (serno: number) => {
    const check = (serno < 0) || (!this._lastSerno || (this._lastSerno && serno === (this._lastSerno + 1)))
    if (check && serno >= 0) {
      this._lastSerno = serno
    }
    return check
  }
}
