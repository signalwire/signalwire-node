import logger from '../../common/src/util/logger'
import BaseSession from '../../common/src/BaseSession'
import { Connect, Subscription } from '../../common/src/messages/Blade'
import Cache from '../../common/src/util/Cache'
import { IBladeConnectResult, SubscribeParams, BroadcastParams } from '../../common/src/util/interfaces'
import { BroadcastHandler } from '../../common/src/services/Broadcast'
import { ADD, REMOVE, SwEvent } from '../../common/src/util/constants'
import { trigger, deRegisterAll } from '../../common/src/services/Handler'
import Calling from './relay/calling/Calling'
import Connection from '../../common/src/services/Connection'

export default class SignalWire extends BaseSession {
  public nodeid: string
  public master_nodeid: string
  public services: { [service: string]: string } = {}

  private _callingInstance: Calling = null
  private _cache: Cache = new Cache()

  async connect(): Promise<void> {
    super.checkConnection()
    this._connection = new Connection(this)
  }

  get calling() {
    if (this._callingInstance === null) {
      this._callingInstance = new Calling(this)
    }
    return this._callingInstance
  }

  protected async _onDisconnect() {
    // TODO: sent unsubscribe for all subscriptions?
    deRegisterAll(this.calling.protocol)
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
