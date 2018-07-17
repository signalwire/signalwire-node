import logger from '../util/logger'
import { ConnectionCallbacks } from '../types'
import { IBladeConnectResult } from '../interfaces'

export default class Connection {
  endpoint: string = 'wss://localhost:2100'
  ws: any
  connected: boolean = false
  cbStore: { [key: string]: { resolve: () => void, reject: () => void, bladeObj: any, time: number } }

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
      const stored = this._pullFromStore(msg.id)
      if (stored) {
        let method = msg.hasOwnProperty('error') ? 'reject' : 'resolve'
        stored.bladeObj.response = msg
        return stored[method](stored.bladeObj)
      }
      this._callback('onMessage', msg)
    }
    this.ws.onerror = (event: any): void => this._callback('onError', event)

    // setTimeout(() => {
    //   logger.info('Going to close..!!!')
    //   this.ws.close()
    // }, 4000)
  }

  send(bladeObj: any): Promise<any> {
    if (!bladeObj.hasOwnProperty('request')) {
      logger.error("Message without request?!", bladeObj)
      return
    }
    const promise = new Promise((resolve, reject) => {
      this._pushInStore(bladeObj, resolve, reject)
    })
    let json = JSON.stringify(bladeObj.request)
    logger.debug("SEND:", json)
    this.ws.send(json)
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

  private _pushInStore(bladeObj: any, resolve: () => void, reject: () => void) {
    let { id } = bladeObj.request
    let time: number = new Date().getTime()
    this.cbStore[id] = { resolve, reject, bladeObj, time }
  }

  private _callback(name: string, ...args: any[]) {
    // logger.debug("Socket =>", name, ...args)
    // this.connected = name !== 'onClose'
    if (this.callbacks && this.callbacks.hasOwnProperty(name)) {
      this.callbacks[name](...args)
    }
  }
}