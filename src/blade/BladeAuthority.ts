import { IBladeAuthority } from '../interfaces'
import BaseMessage from './baseMessage'

class BladeAuthorityAdd extends BaseMessage implements IBladeAuthority {
  method: string = 'blade.authority'
  params: IBladeAuthority['params']

  constructor(authority_nodeid: string) {
    super()

    const command = 'add'
    this.params = { command, authority_nodeid }
  }
}

export { BladeAuthorityAdd }