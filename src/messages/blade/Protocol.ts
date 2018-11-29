import BaseMessage from '../BaseMessage'
import { IBladeProtocolProviderAdd, IBladeProtocolProviderRemove } from '../../interfaces'

const method = 'blade.protocol'

class ProviderAdd extends BaseMessage {
  constructor(protocol: IBladeProtocolProviderAdd['params']) {
    super()

    const params: IBladeProtocolProviderAdd['params'] = {
      command: 'provider.add',
      ...protocol
    }
    this.buildRequest({ method, params })
  }
}

class ProviderRemove extends BaseMessage {
  constructor(protocol: string) {
    super()

    const params: IBladeProtocolProviderRemove['params'] = {
      command: 'provider.remove',
      protocol
    }
    this.buildRequest({ method, params })
  }
}

export { ProviderAdd, ProviderRemove }
