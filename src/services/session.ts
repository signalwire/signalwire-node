import SignalWire from '../SignalWire'
import logger from '../util/logger'
import BladeConnect from '../blade/BladeConnect'
import Connection from './Connection'
import NodeStore from './NodeStore'
import { ConnectionCallbacks } from '../types'
import BladeSubscription from '../blade/BladeSubscription'
import { BLADE_SUBSCRIBE_COMMAND } from '../util/constants'
import BroadcastService from '../services/BroadcastService'

const BLADE_NETCAST = 'blade.netcast'
const BLADE_BROADCAST = 'blade.broadcast'

export default class Session {
  conn: Connection
  sessionid: string = ''
  nodeid: string
  master_nodeid: string
  nodeStore: NodeStore
  services: { [service: string]: string } = {}
  servicesCallback: { [uuid: string]: any } = {}

  private _options: any
  private socketCallbacks: ConnectionCallbacks = {
    onOpen: () => {
      let bc = new BladeConnect({ project: this._options.project, token: this._options.token }, this.sessionid)
      this.conn.send(bc)
        .then(this._onBladeConnect.bind(this))
        .catch(logger.error)
      this._callback('onSocketOpen')
    },
    onClose: (): void => {
      setTimeout(() => this.connect(), 1000)
      this._callback('onSocketClose')
    },
    onMessage: (response: any) => {
      this._onMessageInbound(response)
      this._callback('onMessageInbound', response)
    },
    onError: (error: any): void => {
      logger.error('Session Socket Error', error)
      this._callback('onSocketError', error)
    }
  }

  constructor(private SW: SignalWire) {
    this._options = SW.options
    this.connect()
  }

  connect() {
    this.conn = new Connection(this._options.host, this.socketCallbacks)
  }

  private _onBladeConnect(res: BladeConnect): void {
    // logger.info('Session::onBladeConnect', res)
    // TODO: resume all old subscriptions (in case of a recon)
    this.sessionid = res.response.result.sessionid
    this.nodeid = res.response.result.nodeid
    this.master_nodeid  = res.response.result.master_nodeid
    this.nodeStore = new NodeStore(res.response)

    this._callback('onSessionReady')
  }

  private _onMessageInbound(response: any) {
    // logger.info('Inbound Message', response.method, this.nodeid, response)
    switch (response.method) {
      case BLADE_NETCAST:
        this.nodeStore.netcastUpdate(response.params)
      break
      case BLADE_BROADCAST:
        const x = new BroadcastService(this).handleBroadcast(response.params)
      break
    }
  }

  private _callback(name: string, ...args: any[]) {
    if (this._options.hasOwnProperty('callbacks') && this._options.callbacks.hasOwnProperty(name)) {
      this._options.callbacks[name](this, ...args)
    }
  }

  get connected() {
    return this.conn && this.conn.connected
  }

  addSubscription(protocol: string, channels: string[]) {
    let bs = new BladeSubscription({
      command: BLADE_SUBSCRIBE_COMMAND.ADD,
      subscriber_nodeid: this.nodeid,
      protocol,
      channels
    })
    return this.conn.send(bs)
  }

  removeSubscription(protocol: string, channels: string[]) {
    let bs = new BladeSubscription({
      command: BLADE_SUBSCRIBE_COMMAND.REMOVE,
      subscriber_nodeid: this.nodeid,
      protocol,
      channels
    })
    return this.conn.send(bs)
  }
}