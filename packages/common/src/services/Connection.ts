import logger from '../util/logger'
import BaseSession from '../BaseSession'
import { SwEvent } from '../util/constants'
import { safeParseJson, checkWebSocketHost } from '../util/helpers'
import { registerOnce, trigger } from '../services/Handler'
import { isFunction } from '../util/helpers'

let WebSocketClass: any = typeof WebSocket !== 'undefined' ? WebSocket : null
export const setWebSocket = (websocket: any): void => {
  WebSocketClass = websocket
}

const WS_STATE = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}
const PING_INTERVAL = 5 * 1000
const REQUEST_TIMEOUT = 10 * 1000

export default class Connection {
  private _wsClient: any = null
  private _host: string = 'wss://localhost:2100'
  private _timers: { [id: string]: any } = {}
  private _connected: boolean = false

  public upDur: number = null
  public downDur: number = null

  constructor(public session: BaseSession) {
    this._host = checkWebSocketHost(session.options.host)
    this.connect()
  }

  get connected(): boolean {
    return this._wsClient.readyState === WS_STATE.OPEN
  }

  get connecting(): boolean {
    return this._wsClient.readyState === WS_STATE.CONNECTING
  }

  get closing(): boolean {
    return this._wsClient.readyState === WS_STATE.CLOSING
  }

  get closed(): boolean {
    return this._wsClient.readyState === WS_STATE.CLOSED
  }

  get isAlive(): boolean {
    return this.connecting || this.connected
  }

  get isDead(): boolean {
    return this.closing || this.closed
  }

  connect() {
    this._wsClient = new WebSocketClass(this._host)
    this._wsClient.onopen = (event): boolean => {
      this._connected = true
      this._ping()
      return trigger(SwEvent.SocketOpen, event, this.session.uuid)
    }
    this._wsClient.onclose = (event): boolean => trigger(SwEvent.SocketClose, event, this.session.uuid)
    this._wsClient.onerror = (event): boolean => trigger(SwEvent.SocketError, event, this.session.uuid)
    this._wsClient.onmessage = (event): void => {
      const msg: any = safeParseJson(event.data)
      if (typeof msg === 'string') {
        this._handleStringResponse(msg)
        return
      }
      this._unsetTimer(msg.id)
      logger.debug('RECV: \n', JSON.stringify(msg, null, 2), '\n')
      if (!trigger(msg.id, msg)) {
        // If there is not an handler for this message, dispatch an incoming!
        trigger(SwEvent.SocketMessage, msg, this.session.uuid)
      }
    }
  }

  sendRawText(request: string): void {
    this._wsClient.send(request)
  }

  send(bladeObj: any): Promise<any> {
    const { request } = bladeObj
    const promise = new Promise((resolve, reject) => {
      if (request.hasOwnProperty('result')) {
        return resolve()
      }
      registerOnce(request.id, (response: any) => {
        const { result, error } = response
        if (error) {
          return reject(error)
        }
        if (result) {
          const { result: { code = null, node_id = null, result: nestedResult = null } = {} } = result
          if (code && code !== '200') {
            reject(result)
          } else if (nestedResult) {
            nestedResult.node_id = node_id
            resolve(nestedResult)
          } else {
            resolve(result)
          }
        }
      })
      this._setTimer(request.id)
    })
    logger.debug('SEND: \n', JSON.stringify(request, null, 2), '\n')
    this._wsClient.send(JSON.stringify(request))

    return promise
  }

  close() {
    // FIXME: wait all req/res before close!
    this._wsClient.close()
    this._wsClient = null
  }

  private _unsetTimer(id: string) {
    clearTimeout(this._timers[id])
    delete this._timers[id]
  }

  private _setTimer(id: string) {
    this._timers[id] = setTimeout(() => {
      trigger(id, { error: { code: '408', message: 'Request Timeout' }})
      this._unsetTimer(id)
    }, REQUEST_TIMEOUT)
  }

  private _handleStringResponse(response: string) {
    if (/^#SP/.test(response)) {
      switch (response[3]) {
        case 'U':
          this.upDur = parseInt(response.substring(4))
          break
        case 'D':
          this.downDur = parseInt(response.substring(4))
          trigger(SwEvent.SpeedTest, { upDur: this.upDur, downDur: this.downDur }, this.session.uuid)
          break
      }
    } else {
      logger.warn('Unknown message from socket', response)
    }
  }

  private _ping() {
    if (!this._wsClient || !this._wsClient.ping) {
      return
    }
    if (this._connected) {
      this._connected = false
      this._wsClient.ping('', () => this._connected = true)
      return setTimeout(() => this._ping(), PING_INTERVAL)
    }
    const { _beginClose, close } = this._wsClient
    isFunction(_beginClose) ? _beginClose() : close()
  }
}
