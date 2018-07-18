import { IBladeConnectRequest } from '../interfaces'
import BaseMessage from './baseMessage'

export default class BladeConnect extends BaseMessage {
  method: string = 'blade.connect'

  constructor(authentication: { project: string, token: string }, sessionid?: string) {
    super()
    let params: IBladeConnectRequest['params'] = { version: { major: 2, minor: 0, revision: 0 } }
    if (sessionid) {
      params.sessionid = sessionid
    }
    if (typeof authentication !== 'undefined' && authentication.hasOwnProperty('project') && authentication.hasOwnProperty('token')) {
      params.authentication = authentication
    }
    this.buildRequest({ method: this.method, params })
  }
}