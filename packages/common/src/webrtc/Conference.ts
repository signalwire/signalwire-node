import logger from '../util/logger'
import BrowserSession from '../BrowserSession'
import { register, deRegisterAll } from '../services/Handler'
import { checkSubscribeResponse } from './helpers'
import { ConferenceAction, Notification } from './constants'
import { VertoPvtData } from './interfaces'
import { mutateLiveArrayData } from '../util/helpers'
import { MCULayoutEventHandler } from './LayoutHandler'

export default class Conference {

  private pvtData: VertoPvtData
  private _lastSerno = 0

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

  get participantId() {
    return this.pvtData.conferenceMemberID
  }

  get participantRole() {
    return this.pvtData.role
  }

  get channels() {
    const { laChannel, chatChannel, infoChannel, modChannel } = this.pvtData
    return [laChannel, chatChannel, infoChannel, modChannel].filter(Boolean)
  }

  join(pvtData: VertoPvtData) {
    this.pvtData = pvtData
    this._subscribe()

    this.session.calls[this.callId].extension = this.pvtData.laName
    this._dispatchConferenceUpdate({ action: ConferenceAction.Join, conferenceName: this.pvtData.laName, participantId: this.participantId, role: this.participantRole })
  }

  part(pvtData: VertoPvtData) {
    this.pvtData = pvtData
    this._dispatchConferenceUpdate({ action: ConferenceAction.Leave, conferenceName: this.pvtData.laName, participantId: this.participantId, role: this.participantRole })
  }

  destroy() {
    return this._unsubscribe()
  }

  sendChatMessage(message: string, type: string) {
    this.session.vertoBroadcast({ nodeId: this.nodeId, channel: this.pvtData.chatChannel, data: { action: 'send', message, type } })
  }

  listVideoLayouts() {
    this._modCommand('list-videoLayouts')
  }

  playMedia(file: string) {
    this._modCommand('play', null, file)
  }

  stopMedia() {
    this._modCommand('stop', null, 'all')
  }

  deaf(participantId: number | string) {
    this._modCommand('deaf', participantId)
  }

  undeaf(participantId: number | string) {
    this._modCommand('undeaf', participantId)
  }

  startRecord(file: string) {
    this._modCommand('recording', null, ['start', file])
  }

  stopRecord() {
    this._modCommand('recording', null, ['stop', 'all'])
  }

  snapshot(file: string) {
    this._modCommand('vid-write-png', null, file)
  }

  setVideoLayout(layout: string, canvasID: number) {
    const value = canvasID ? [layout, canvasID] : layout
    this._modCommand('vid-layout', null, value)
  }

  kick(participantId: number | string) {
    this._modCommand('kick', participantId)
  }

  muteMic(participantId: number | string) {
    this._modCommand('tmute', participantId)
  }

  muteVideo(participantId: number | string) {
    this._modCommand('tvmute', participantId)
  }

  presenter(participantId: number | string) {
    this._modCommand('vid-res-id', participantId, 'presenter')
  }

  videoFloor(participantId: number | string) {
    this._modCommand('vid-floor', participantId, 'force')
  }

  banner(participantId: number | string, text: string) {
    this._modCommand('vid-banner', participantId, encodeURI(text))
  }

  volumeDown(participantId: number | string) {
    this._modCommand('volume_out', participantId, 'down')
  }

  volumeUp(participantId: number | string) {
    this._modCommand('volume_out', participantId, 'up')
  }

  gainDown(participantId: number | string) {
    this._modCommand('volume_in', participantId, 'down')
  }

  gainUp(participantId: number | string) {
    this._modCommand('volume_in', participantId, 'up')
  }

  transfer(participantId: number | string, exten: string) {
    this._modCommand('transfer', participantId, exten)
  }

  laChannelHandler({ data: packet }: any) {
    // FIXME: 'reorder' - changepage' - 'heartbeat' methods not implemented
    if (!this._checkSerno(packet.wireSerno)) {
      logger.error('Invalid conference wireSerno:', packet)
      return this._bootstrap()
    }
    const { action, data, hashKey: callId, arrIndex: index } = packet
    switch (action) {
      case 'bootObj': {
        this._lastSerno = 0
        const participants = []
        for (const i in data) {
          participants.push({ callId: data[i][0], index: Number(i), ...mutateLiveArrayData(data[i][1]) })
        }
        return this._dispatchConferenceUpdate({ action: ConferenceAction.Bootstrap, participants })
      }
      case 'add':
        return this._dispatchConferenceUpdate({ action: ConferenceAction.Add, callId, index, ...mutateLiveArrayData(data) })
      case 'modify':
        return this._dispatchConferenceUpdate({ action: ConferenceAction.Modify, callId, index, ...mutateLiveArrayData(data) })
      case 'del':
        return this._dispatchConferenceUpdate({ action: ConferenceAction.Delete, callId, index, ...mutateLiveArrayData(data) })
      case 'clear':
        return this._dispatchConferenceUpdate({ action: ConferenceAction.Clear })
      default:
        return this._dispatchConferenceUpdate({ action, data, callId, index })
    }
  }

  infoChannelHandler(params: any) {
    const { eventData } = params
    switch (eventData.contentType) {
      case 'layout-info':
        // FIXME: workaround to fix missing callID on payload
        eventData.callID = this.callId
        return MCULayoutEventHandler(this.session, eventData)
      default:
        logger.error('Conference info unknown contentType', params)
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

  private _bootstrap() {
    console.warn('Sending conf bootstrap!')
    const { laName, laChannel } = this.pvtData
    const data = { liveArray: { command: 'bootstrap', context: laChannel, name: laName } }
    this.session.vertoBroadcast({ nodeId: this.nodeId, channel: laChannel, data })
  }

  private _confControl(channel: string, params: any = {}) {
    const data = {
      application: 'conf-control',
      callID: this.callId,
      value: null,
      ...params
    }
    this.session.vertoBroadcast({ nodeId: this.nodeId, channel, data })
  }

  private _modCommand = (command: string, id = null, value = null): void => {
    this._confControl(this.pvtData.modChannel, { command, id, value })
  }

  private async _subscribe() {
    const { laChannel, chatChannel, infoChannel, modChannel } = this.pvtData
    const params = {
      nodeId: this.nodeId,
      channels: this.channels
    }
    try {
      const result = await this.session.vertoSubscribe(params)
      if (checkSubscribeResponse(result, laChannel)) {
        register(laChannel, this.laChannelHandler)
        this._bootstrap()
      }
      if (checkSubscribeResponse(result, chatChannel)) {
        register(chatChannel, this.chatChannelHandler)
      }
      if (checkSubscribeResponse(result, infoChannel)) {
        register(infoChannel, this.infoChannelHandler)
      }
      if (checkSubscribeResponse(result, modChannel)) {
        register(modChannel, this.modChannelHandler)
      }
    } catch (error) {
      logger.error('Conference subscriptions error:', error)
    }
  }

  private async _unsubscribe() {
    const params = {
      nodeId: this.nodeId,
      channels: this.channels
    }
    try {
      await this.session.vertoUnsubscribe(params)
    } catch (error) {
      logger.error('Conference unsubscribe error:', error)
    }
    this.channels.forEach(deRegisterAll)
    this._lastSerno = 0
  }

  private _dispatchConferenceUpdate(params: any) {
    this.session.calls[this.callId]._dispatchNotification({ type: Notification.ConferenceUpdate, ...params })
  }

  private _checkSerno = (serno: number) => {
    const check = (serno < 0) || (!this._lastSerno || (this._lastSerno && serno === (this._lastSerno + 1)))
    if (check && serno >= 0) {
      this._lastSerno = serno
    }
    return check
  }
}
