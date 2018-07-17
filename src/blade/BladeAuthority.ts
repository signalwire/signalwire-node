import { IBladeAuthority } from '../interfaces'
import BaseMessage from './baseMessage'

class BladeAuthorityAdd extends BaseMessage {
  method: string = 'blade.authority'

  constructor(authority_nodeid: string) {
    super()
    const params = { command: 'add', authority_nodeid }
    this.buildRequest({ method: this.method, params })
  }
}

export { BladeAuthorityAdd }