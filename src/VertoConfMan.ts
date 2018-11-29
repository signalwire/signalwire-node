import Verto from './Verto'

export default class VertoConfMan {

  constructor(public session: Verto, public params: any = {}) {
    this.params = Object.assign({ hasVid: false, laData: {} }, params)

    const { onBroadcast, infoCallback, chatCallback, laData, hasVid } = this.params
    if (onBroadcast instanceof Function && laData.hasOwnProperty('modChannel')) {
      session.subscribe({ eventChannel: laData.modChannel, handler: onBroadcast.bind(this) })
    }

    if (infoCallback instanceof Function && laData.hasOwnProperty('infoChannel')) {
      session.subscribe({ eventChannel: laData.infoChannel, handler: infoCallback.bind(this) })
    }

    if (chatCallback instanceof Function && laData.hasOwnProperty('chatChannel')) {
      session.subscribe({ eventChannel: laData.chatChannel, handler: chatCallback.bind(this) })
    }

    if (laData.role === 'moderator' && hasVid) {
      this.modCommand('list-videoLayouts')
    }
  }

  modCommand(command: string, memberID: any = null, value: any = null) {
    const { modChannel: eventChannel } = this.params.laData
    if (!eventChannel) {
      throw new Error('Invalid channel. Are you a moderator?!')
    }
    const application = 'conf-control'
    const id = parseInt(memberID) || null
    this.session.broadcast({ eventChannel, data: { application, command, id, value } })
  }

  sendChat(message, type) {
    const eventChannel = this.params.laData.chatChannel
    this.session.broadcast({ eventChannel, data: { action: 'send', message, type } })
  }

  destroy() {
    const { chatChannel, infoChannel, modChannel } = this.params.laData
    if (chatChannel) {
      this.session.unsubscribe(chatChannel)
    }

    if (infoChannel) {
      this.session.unsubscribe(infoChannel)
    }

    if (modChannel) {
      this.session.unsubscribe(modChannel)
    }
  }

  listVideoLayouts() {
    this.modCommand('list-videoLayouts')
  }

  play(file: string) {
    this.modCommand('play', null, file)
  }

  stop() {
    this.modCommand('stop', null, 'all')
  }

  deaf(memberID: number | string) {
    this.modCommand('deaf', memberID)
  }

  undeaf(memberID: number | string) {
    this.modCommand('undeaf', memberID)
  }

  record(file) {
    this.modCommand('recording', null, ['start', file])
  }

  stopRecord() {
    this.modCommand('recording', null, ['stop', 'all'])
  }

  snapshot(file) {
    if (!this.params.hasVid) {
      throw 'Conference has no video'
    }
    this.modCommand('vid-write-png', null, file)
  }

  setVideoLayout(layout, canvasID) {
    if (!this.params.hasVid) {
      throw 'Conference has no video'
    }
    if (canvasID) {
      this.modCommand('vid-layout', null, [layout, canvasID])
    } else {
      this.modCommand('vid-layout', null, layout)
    }
  }

  kick(memberID: number | string) {
    this.modCommand('kick', memberID)
  }

  muteMic(memberID: number | string) {
    this.modCommand('tmute', memberID)
  }

  muteVideo(memberID: number | string) {
    this._videoRequired()
    this.modCommand('tvmute', memberID)
  }

  presenter(memberID: number | string) {
    this._videoRequired()
    this.modCommand('vid-res-id', memberID, 'presenter')
  }

  videoFloor(memberID: number | string) {
    this._videoRequired()
    this.modCommand('vid-floor', memberID, 'force')
  }

  banner(memberID, text) {
    this._videoRequired()
    this.modCommand('vid-banner', memberID, escape(text))
  }

  volumeDown(memberID: number | string) {
    this.modCommand('volume_out', memberID, 'down')
  }

  volumeUp(memberID: number | string) {
    this.modCommand('volume_out', memberID, 'up')
  }

  gainDown(memberID: number | string) {
    this.modCommand('volume_in', memberID, 'down')
  }

  gainUp(memberID: number | string) {
    this.modCommand('volume_in', memberID, 'up')
  }

  transfer(memberID: number | string, exten: string) {
    this.modCommand('transfer', memberID, exten)
  }

  private _videoRequired(): void {
    if (!this.params.hasVid) {
      throw 'Conference has no video'
    }
  }
}
