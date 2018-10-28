import logger from './util/logger'
import { IBladeConnectResult } from './interfaces'
import { NETCAST_SUBCOMMAND } from './util/constants'

export default class Cache {
  protocols: string[]

  populateFromConnect(data: IBladeConnectResult) {
    const { protocols_uncertified } = data.result
    this.protocols = protocols_uncertified

    this._printStats()
  }

  netcastUpdate(params: any) { // TODO: specify params type
    logger.info('NETCAST: %s', params.command, params)
    const { params: subParams }: any = params
    switch (params.command) {
      case NETCAST_SUBCOMMAND.PROTOCOL_PROVIDER_ADD:
        // this._protocolProviderAdd(subParams)
        break
      case NETCAST_SUBCOMMAND.PROTOCOL_PROVIDER_REMOVE:
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
