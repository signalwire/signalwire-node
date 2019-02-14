import logger from '../../common/src/util/logger'
import BrowserSession from './BrowserSession'
import { Connect } from '../../common/src/messages/Blade'
import Cache from '../../common/src/util/Cache'
import { IBladeConnectResult } from '../../common/src/util/interfaces'
import { BroadcastHandler } from '../../common/src/services/Broadcast'
import { SwEvent } from '../../common/src/util/constants'
import { trigger } from '../../common/src/services/Handler'

export default class SignalWire extends BrowserSession {
  public nodeid: string
  public master_nodeid: string
  public services: { [service: string]: string } = {}

  private _cache: Cache = new Cache()

  protected async _onDisconnect() {
    // TODO: sent unsubscribe for all subscriptions?
  }

  protected async _onSocketOpen() {
    const bc = new Connect({ project: this.options.project, token: this.options.token }, this.sessionid)
    const response: IBladeConnectResult = await this.execute(bc)
    this.sessionid = response.sessionid
    this.nodeid = response.nodeid
    this.master_nodeid = response.master_nodeid
    this._cache.populateFromConnect(response)
    trigger(SwEvent.Ready, this, this.uuid)
  }

  protected _onSocketClose() {
    setTimeout(() => this.connect(), 1000)
  }

  protected _onSocketError(error) {
    logger.error('Socket error', error)
  }

  protected _onSocketMessage(response: any) {
    const { method, params } = response
    logger.info('Inbound Message', method, params)
    switch (method) {
      case 'blade.netcast':
        this._cache.netcastUpdate(params)
      break
      case 'blade.broadcast':
        BroadcastHandler(params)
      break
    }
  }
}
