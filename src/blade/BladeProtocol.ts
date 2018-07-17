import { IBladeProtocolProviderAdd, IBladeProtocolProviderRemove } from '../interfaces'
import BaseMessage from './baseMessage'

class ProviderAdd extends BaseMessage implements IBladeProtocolProviderAdd {
  method: string = 'blade.protocol'
  params: IBladeProtocolProviderAdd['params']

  constructor(protocol: IBladeProtocolProviderAdd['params']) {
    super()
    let command = 'provider.add'
    this.params = { command, ...protocol }
  }
}

class ProviderRemove extends BaseMessage implements IBladeProtocolProviderRemove {
  method: string = 'blade.protocol'
  params: IBladeProtocolProviderRemove['params']

  constructor(provider_nodeid: string, protocol: string) {
    super()
    let command = 'provider.remove'
    this.params = { command, provider_nodeid, protocol }
  }
}

export { ProviderAdd, ProviderRemove }