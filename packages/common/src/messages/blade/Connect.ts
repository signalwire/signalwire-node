import BaseMessage from '../BaseMessage'
import { IBladeConnectRequest } from '../../util/interfaces'

const major = 2
const minor = 1
const revision = 0

class Connect extends BaseMessage {
  method: string = 'blade.connect'

  constructor(authentication: { project: string, token: string }, sessionid?: string) {
    super()

    const params: IBladeConnectRequest['params'] = {
      version: { major, minor, revision },
      authentication: authentication
    }
    if (sessionid) {
      params.sessionid = sessionid
    }
    this.buildRequest({ method: this.method, params })
  }
}

export { Connect }
