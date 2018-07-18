import logger from '../util/logger'
import { ConnectionCallbacks } from '../types'

export default class Connection {
  address: string = 'wss://localhost:2100'
  ws: any
  connected: boolean = false
  cbStore: { [key: string]: { resolve: () => void, reject: () => void, bladeObj: any, time: number } }

  constructor(public options: any, public callbacks: ConnectionCallbacks) {
    if (options && options.hasOwnProperty('address')) {
      this.address = options.address
    }
    this.cbStore = {}
    this.connect()
  }

  connect() {
    this.ws = new WebSocket(this.address)
    this.ws.onopen = (): void => this._callback('onOpen')
    this.ws.onclose = (): void => this._callback('onClose')
    this.ws.onerror = (event: any): void => this._callback('onError', event)
    this.ws.onmessage = (event: any): void => {
      logger.debug("RECV: \n", event.data, "\n")
      let msg: any = JSON.parse(event.data)
      const stored = this._pullFromStore(msg.id)
      if (stored) {
        let method = msg.hasOwnProperty('error') ? 'reject' : 'resolve'
        stored.bladeObj.response = msg
        return stored[method](stored.bladeObj)
      }
      this._callback('onMessage', msg)
    }

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
    logger.debug("SEND: \n", json, "\n")
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
    if (this.callbacks && this.callbacks.hasOwnProperty(name)) {
      this.callbacks[name](...args)
    }
  }
}