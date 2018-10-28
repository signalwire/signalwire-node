import SignalWire from './SignalWire'
import logger from './util/logger'
import { Connect, Subscription } from './blade/Blade'
import Connection from './Connection'
import Cache from './Cache'
import { BLADE_SUBSCRIBE_COMMAND, EVENTS } from './util/constants'
import BroadcastService from './services/BroadcastService'
import { IBladeConnectResult } from './interfaces'

export default class Session {
  sessionid: string = ''
  nodeid: string
  master_nodeid: string
  services: { [service: string]: string } = {}

  private _options: any
  private _cache: Cache
  private _connection: Connection

  constructor(private SW: SignalWire) {
    this._options = SW.options
    this._registerHandlers()
  }

  connect() {
    this._connection = new Connection(this._options.host)
  }

  async execute(msg: any) {
    const response = await this._connection.send(msg)
      .catch(msg => logger.error('Execute Error ', msg.error))
    if (response === undefined) {
      throw new Error('Internal Error')
    }
    return response.result.result
  }

  async addSubscription(protocol: string, channels: string[]) {
    const bs = new Subscription({ command: BLADE_SUBSCRIBE_COMMAND.ADD, protocol, channels })
    const result = await this.execute(bs)
    if (result.hasOwnProperty('failed_channels') && result.failed_channels.length) {
      throw new Error(`Failed to subscribe to channels ${result.failed_channels.join(', ')}`)
    }
    return result
  }

  async removeSubscription(protocol: string, channels: string[]) {
    const bs = new Subscription({ command: BLADE_SUBSCRIBE_COMMAND.REMOVE, protocol, channels })
    return this.execute(bs)
  }

  private _registerHandlers() {
    PubSub.subscribe(EVENTS.WS_OPEN, this._onOpen.bind(this))
    PubSub.subscribe(EVENTS.WS_CLOSE, this._onClose.bind(this))
    PubSub.subscribe(EVENTS.WS_MESSAGE, this._onIncomingMessage.bind(this))
    PubSub.subscribe(EVENTS.WS_ERROR, this._onError.bind(this))
  }

  private _onOpen = async () => {
    const bc = new Connect({ project: this._options.project, token: this._options.token }, this.sessionid)
    const response: IBladeConnectResult = await this.execute(bc)
    this.sessionid = response.result.sessionid
    this.nodeid = response.result.nodeid
    this.master_nodeid = response.result.master_nodeid
    this._cache.populateFromConnect(response)

    PubSub.publish(EVENTS.READY, this)
  }

  private _onClose = () => {
    setTimeout(() => this.connect(), 1000)
  }

  private _onError = (error) => {
    logger.error('Socket error', error)
  }

  private _onIncomingMessage(response: any) {
    // logger.info('Inbound Message', response.method, this.nodeid, response)
    switch (response.method) {
      case 'blade.netcast':
        this._cache.netcastUpdate(response.params)
      break
      case 'blade.broadcast':
        const x = new BroadcastService(this).handleBroadcast(response.params)
      break
    }
  }
}
