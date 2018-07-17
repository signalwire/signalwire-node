import SignalWire from '../SignalWire'
import { IBladeConnectResult } from '../interfaces'
import logger from '../util/logger'
import BladeConnect from '../blade/BladeConnect'
import Connection from './Connection'
import NodeStore from './NodeStore'
import { ConnectionCallbacks } from '../types'

const BLADE_NETCAST = 'blade.netcast'
const BLADE_BROADCAST = 'blade.broadcast'

export default class Session {
  conn: Connection
  sessionid: string = ''
  nodeid: string
  master_nodeid: string
  nodeStore: NodeStore

  constructor(private SW: SignalWire, public cbReady?: () => void) {
    this.connect()
  }

  connect() {
    const callbacks: ConnectionCallbacks = {
      onOpen: this.onSocketOpen.bind(this),
      onClose: (): void => {
        logger.info('Session is closed.. try again!')
        setTimeout(() => this.connect(), 1000)
      },
      onMessage: this.onInboundMessage.bind(this),
      onError: (error: any): void => {
        logger.info('Session::onError', error)
      }
    }
    this.conn = new Connection(callbacks)
  }

  onSocketOpen(): void {
    let bc = new BladeConnect(this.SW.authentication, this.sessionid)
    this.conn.send(bc)
      .then(this._onBladeConnect.bind(this))
      .catch(logger.error)
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

    if (typeof this.cbReady === 'function') {
      this.cbReady()
    }
  }

  onInboundMessage(response: any) {
    logger.info('%s :: %s', this.nodeid, response.method, response)
    switch (response.method) {
      case BLADE_NETCAST:
        // this.nodeStore.netcastUpdate(response.params)
      break
      case BLADE_BROADCAST:
        logger.info(BLADE_BROADCAST, "What should i do?")
      break
    }
  }

  get connected() {
    return this.conn && this.conn.connected
  }
}