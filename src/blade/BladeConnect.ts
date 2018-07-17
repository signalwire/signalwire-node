import { IBladeConnectRequest } from '../interfaces'
import BaseMessage from './baseMessage'

export default class BladeConnect extends BaseMessage implements IBladeConnectRequest {
  method: string = 'blade.connect'
  params: IBladeConnectRequest['params'] = {
    version: { major: 2, minor: 0, revision: 0 }
  }

  constructor(sessionid?: string) {
    super()

    if (sessionid) {
      this.params.sessionid = sessionid
    }
    // TODO: Add 'authentication' if i'm not certified
    if (true) {
      this.params.authentication = {}
    }
  }
}