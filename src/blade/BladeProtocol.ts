import { IBladeProtocolProviderAdd, IBladeProtocolProviderRemove } from '../interfaces'
import BaseMessage from './baseMessage'

class ProviderAdd extends BaseMessage {
  method: string = 'blade.protocol'
  params: IBladeProtocolProviderAdd['params']

  constructor(protocol: IBladeProtocolProviderAdd['params']) {
    super()
    const params = { command: 'provider.add', ...protocol }
    this.buildRequest({ method: this.method, params })
  }
}

class ProviderRemove extends BaseMessage {
  method: string = 'blade.protocol'
  params: IBladeProtocolProviderRemove['params']

  constructor(provider_nodeid: string, protocol: string) {
    super()
    const params = { command: 'provider.remove', provider_nodeid, protocol }
    this.buildRequest({ method: this.method, params })
  }
}

export { ProviderAdd, ProviderRemove }