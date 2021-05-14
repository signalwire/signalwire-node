import BrowserSession from '../BrowserSession'
import { IConferenceInfo } from './interfaces'
import { publicModMethods } from './ModChannelHandler'
import { publicChatMethods } from './ChatChannelHandler'
import { publicInfoMethods } from './InfoChannelHandler'
import { publicLiveArrayMethods } from './LaChannelHandler'

export default class Conference implements Partial<IConferenceInfo> {
  uuid: string
  md5: string
  domain: string
  laChannel: string
  infoChannel: string
  chatChannel: string
  modChannel: string
  confName: string
  isPrivate: boolean

  constructor (session: BrowserSession, params: Partial<IConferenceInfo>) {
    const { uuid, md5, domain, laChannel, infoChannel, chatChannel, modChannel = null, confName, isPrivate = false } = params
    this.uuid = uuid
    this.md5 = md5
    this.domain = domain
    this.laChannel = laChannel
    this.infoChannel = infoChannel
    this.chatChannel = chatChannel
    this.modChannel = modChannel
    this.confName = confName
    this.isPrivate = isPrivate

    const modObject = {
      session: session,
      nodeId: session.nodeid,
      channel: this.modChannel || null,
    }
    Object.keys(publicModMethods).forEach(method => {
      Object.defineProperty(this, method, {
        configurable: true,
        writable: true,
        value: publicModMethods[method].bind(modObject)
      })
    })

    const chatObject = {
      session: session,
      nodeId: session.nodeid,
      channel: this.chatChannel || null,
    }
    Object.keys(publicChatMethods).forEach(method => {
      Object.defineProperty(this, method, {
        configurable: true,
        writable: true,
        value: publicChatMethods[method].bind(chatObject)
      })
    })

    const infoObject = {
      session: session,
      nodeId: session.nodeid,
      channel: this.infoChannel || null,
    }
    Object.keys(publicInfoMethods).forEach(method => {
      Object.defineProperty(this, method, {
        configurable: true,
        writable: true,
        value: publicInfoMethods[method].bind(infoObject)
      })
    })

    const laObject = {
      session: session,
      nodeId: session.nodeid,
      channel: this.laChannel || null,
    }
    Object.keys(publicLiveArrayMethods).forEach(method => {
      Object.defineProperty(this, method, {
        configurable: true,
        writable: true,
        value: publicLiveArrayMethods[method].bind(laObject)
      })
    })
  }
}
