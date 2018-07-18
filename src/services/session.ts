import SignalWire from '../SignalWire'
import logger from '../util/logger'
import BladeConnect from '../blade/BladeConnect'
import Connection from './Connection'
import NodeStore from './NodeStore'
import { ConnectionCallbacks } from '../types'
import BladeSubscription from '../blade/BladeSubscription'
import { BLADE_SUBSCRIBE_COMMAND } from '../util/constants'

const BLADE_NETCAST = 'blade.netcast'
const BLADE_BROADCAST = 'blade.broadcast'

export default class Session {
  conn: Connection
  sessionid: string = ''
  nodeid: string
  master_nodeid: string
  nodeStore: NodeStore
  private _options: any

  constructor(private SW: SignalWire) {
    this._options = SW.options
    this.connect()
  }

  connect() {
    const callbacks: ConnectionCallbacks = {
      onOpen: () => {
        let bc = new BladeConnect(this._options.authentication, this.sessionid)
        this.conn.send(bc)
          .then(this._onBladeConnect.bind(this))
          .catch(logger.error)
        this._callback('onSocketOpen')
      },
      onClose: (): void => {
        logger.error('Session is closed.. try again!')
        setTimeout(() => this.connect(), 1000)
        this._callback('onSocketClose')
      },
      onMessage: (response: any) => {
        this._onMessageInbound(response)
        this._callback('onMessageInbound', response)
      },
      onError: (error: any): void => {
        logger.error('Session::onError', error)
        this._callback('onSocketError', error)
      }
    }
    this.conn = new Connection(this._options.socket, callbacks)
  }

  private _onBladeConnect(bladeConnect: BladeConnect): void {
    if (!bladeConnect.hasOwnProperty('response')) {
      logger.error('BladeConnect without response?!', bladeConnect)
      return
    }
    logger.info('Session::onBladeConnect', bladeConnect)
    this.sessionid = bladeConnect.response.result.sessionid
    this.nodeid = bladeConnect.response.result.nodeid
    this.master_nodeid  = bladeConnect.response.result.master_nodeid
    this.nodeStore = new NodeStore(bladeConnect.response)

    this._callback('onSessionReady')
  }

  private _onMessageInbound(response: any) {
    logger.info('%s :: %s', this.nodeid, response.method, response)
    switch (response.method) {
      case BLADE_NETCAST:
        this.nodeStore.netcastUpdate(response.params)
      break
      case BLADE_BROADCAST:
        logger.info(BLADE_BROADCAST, "What should i do?")
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