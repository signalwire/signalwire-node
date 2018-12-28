import logger from './util/logger'
import BaseSession from './BaseSession'
import { SwEvent } from './util/constants'
import { registerOnce, trigger } from './services/Handler'

const PATTERN = /^(ws|wss):\/\//
export default class Connection {
  private _wsClient: any = null
  private _host: string = 'wss://localhost:2100'

  constructor(public session: BaseSession) {
    const { host } = session.options
    const protocol = PATTERN.test(host) ? '' : 'wss://'
    this._host = `${protocol}${session.options.host}`
    this.connect()
  }

  get connected(): boolean {
    return this._wsClient.readyState === WebSocket.OPEN
  }

  connect() {
    this._wsClient = new WebSocket(this._host)
    this._wsClient.onopen = (event): boolean => trigger(SwEvent.SocketOpen, event, this.session.uuid)
    this._wsClient.onclose = (event): boolean => trigger(SwEvent.SocketClose, event, this.session.uuid)
    this._wsClient.onerror = (event): boolean => trigger(SwEvent.SocketError, event, this.session.uuid)
    this._wsClient.onmessage = (event): void => {
      const msg: any = JSON.parse(event.data)
      // logger.debug('RECV: \n', JSON.stringify(msg, null, 2), '\n')
      if (!trigger(msg.id, msg)) {
        // If there is not an handler for this message, dispatch an incoming!
        trigger(SwEvent.SocketMessage, msg, this.session.uuid)
      }
    }
  }

  send(bladeObj: any): Promise<any> {
    const { request } = bladeObj
    const promise = new Promise((resolve, reject) => {
      if (!request.hasOwnProperty('result')) {
        registerOnce(request.id, response => {
          response.hasOwnProperty('error') ? reject(response.error) : resolve(response.result)
        })
      } else {
        resolve()
      }
    })
    // logger.debug('SEND: \n', JSON.stringify(request, null, 2), '\n')
    this._wsClient.send(JSON.stringify(request))

    return promise
  }

  close() {
    this._wsClient.onclose = null
    this._wsClient.close()
    this._wsClient = null
  }
}
