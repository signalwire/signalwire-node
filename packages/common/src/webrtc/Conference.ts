import BrowserSession from '../BrowserSession'
import { IConferenceInfo } from './interfaces'
import { publicModMethods } from './ModChannelHandler'

export default class Conference implements Partial<IConferenceInfo> {
  uuid: string
  md5: string
  domain: string
  laChannel: string
  infoChannel: string
  modChannel: string
  confName: string
  isPrivate: boolean

  constructor (session: BrowserSession, params: IConferenceInfo) {
    const { uuid, md5, domain, laChannel, infoChannel, modChannel = null, confName, isPrivate = false } = params
    this.uuid = uuid
    this.md5 = md5
    this.domain = domain
    this.laChannel = laChannel
    this.infoChannel = infoChannel
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
  }
}
