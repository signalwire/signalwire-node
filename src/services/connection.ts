import logger from '../util/logger'
import { ConnectionCallbacks } from '../types'
import { IBladeConnectResult } from '../interfaces'

export default class Connection {
  endpoint: string = 'wss://localhost:2100'
  ws: any
  connected: boolean = false
  cbStore: { [key: string]: { resolve: () => void, reject: () => void, time: number } }

  constructor(public callbacks: ConnectionCallbacks) {
    this.cbStore = {}
    this.connect()
  }

  connect() {
    this.ws = new WebSocket(this.endpoint)
    this.ws.onopen = (): void => this._callback('onOpen')
    this.ws.onclose = (): void => this._callback('onClose')
    this.ws.onmessage = (event: any): void => {
      let msg: any = JSON.parse(event.data)
      const cb = this._pullFromStore(msg.id)
      if (cb) {
        let method = msg.hasOwnProperty('error') ? 'reject' : 'resolve'
        return cb[method](msg)
      }
      this._callback('onMessage', msg)
    }
    this.ws.onerror = (event: any): void => this._callback('onError', event)

    // setTimeout(() => {
    //   logger.info('Going to close..!!!')
    //   this.ws.close()
    // }, 4000)
  }

  send(data: any): Promise<any> {
    if (!data.hasOwnProperty('id')) {
      logger.error("Message withoud ID is not allowed!", data)
      return
    }
    const promise = new Promise((resolve, reject) => {
      this._pushInStore(data.id, resolve, reject)
    })
    logger.debug("SEND:", JSON.stringify(data))
    this.ws.send( JSON.stringify(data) )
    return promise
  }

  private _pullFromStore(id: string): any {
    if (!this.cbStore.hasOwnProperty(id)) {
      return false
    }
    let stored = this.cbStore[id]
    let time = new Date().getTime()
    logger.debug("Found callback for '%s' in %d sec", id, (time - stored.time) / 1000)
    delete this.cbStore[id]
    return stored
  }

  private _pushInStore(id: string, resolve: () => void, reject: () => void) {
    let time: number = new Date().getTime()
    this.cbStore[id] = { resolve, reject, time }
  }

  private _callback(name: string, ...args: any[]) {
    // logger.debug("Socket =>", name, ...args)
    // this.connected = name !== 'onClose'
    if (this.callbacks && this.callbacks.hasOwnProperty(name)) {
      this.callbacks[name](...args)
    }
  }
}