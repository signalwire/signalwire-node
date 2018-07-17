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

  constructor(public cbReady?: () => void) {
    // process.on('beforeExit', (): void => {
    //   logger.info('Process is in closing state..Wait 1s and retry')
    //   setTimeout(() => this.connect(), 1000)
    // })
    this.connect()
  }

  connect() {
    const callbacks: ConnectionCallbacks = {
      onOpen: this.onSocketOpen.bind(this),
      onClose: (): void => {
        logger.info('Session::onClose')
      },
      onMessage: this.onInboundMessage.bind(this),
      onError: (error: any): void => {
        logger.info('Session::onError', error)
      }
    }
    this.conn = new Connection(callbacks)
  }

  onSocketOpen(): void {
    let bc = new BladeConnect(this.sessionid)
    this.conn.send(bc)
      .then(this._onBladeConnect.bind(this))
      .catch(logger.error)
  }

  private _onBladeConnect(response: IBladeConnectResult): void {
    logger.info('Session::onBladeConnect', response)
    this.sessionid = response.result.sessionid
    this.nodeid = response.result.nodeid
    this.master_nodeid  = response.result.master_nodeid
    this.nodeStore = new NodeStore(response)

    if (typeof this.cbReady === 'function') {
      this.cbReady()
    }
  }

  onInboundMessage(response: any) {
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

  get connected() {
    return this.conn && this.conn.connected
  }
}