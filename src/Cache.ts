import logger from './util/logger'
import { IBladeConnectResult } from './interfaces'
import { Netcast } from './util/constants'

export default class Cache {
  protocols: string[]

  populateFromConnect(data: IBladeConnectResult) {
    const { protocols_uncertified } = data
    this.protocols = protocols_uncertified

    this._printStats()
  }

  netcastUpdate(params: any) { // TODO: specify params type
    logger.info('NETCAST: %s', params.command, params)
    const { params: subParams }: any = params
    switch (params.command) {
      case Netcast.ProtocolProviderAdd:
        // this._protocolProviderAdd(subParams)
        break
      case Netcast.ProtocolProviderRemove:
        // this._protocolProviderRemove(subParams)
        break
      default:
        logger.error('Unknow command %s. What should i do?', params.command)
    }

    this._printStats()
  }

  /* Print in console cached data */
  private _printStats() {
    const stats: any = {
      protocols: this.protocols
    }
    logger.debug('Cache Updated:', JSON.parse(JSON.stringify(stats)))
  }
}
