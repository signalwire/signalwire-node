import logger from '../util/logger'
import BaseSession from '../BaseSession'
import { SwEvent } from '../util/constants'
import { safeParseJson } from '../util/helpers'
import { registerOnce, trigger } from '../services/Handler'

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

const PATTERN = /^(ws|wss):\/\//
export default class Connection {
  private _wsClient: any = null
  private _host: string = 'wss://localhost:2100'

  public upDur: number = null
  public downDur: number = null

  constructor(public session: BaseSession) {
    const { host } = session.options
    const protocol = PATTERN.test(host) ? '' : 'wss://'
    this._host = `${protocol}${session.options.host}`
    this.connect()
  }

  get connected(): boolean {
    return this._wsClient.readyState === WS_STATE.OPEN
  }

  connect() {
    this._wsClient = new WebSocketClass(this._host)
    this._wsClient.onopen = (event): boolean => trigger(SwEvent.SocketOpen, event, this.session.uuid)
    this._wsClient.onclose = (event): boolean => trigger(SwEvent.SocketClose, event, this.session.uuid)
    this._wsClient.onerror = (event): boolean => trigger(SwEvent.SocketError, event, this.session.uuid)
    this._wsClient.onmessage = (event): void => {
      const msg: any = safeParseJson(event.data)
      if (typeof msg === 'string') {
        this._handleStringResponse(msg)
        return
      }
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
          const { result: { code = null } = {} } = result
          code && code !== '200' ? reject(result) : resolve(result)
        }
      })
    })
    logger.debug('SEND: \n', JSON.stringify(request, null, 2), '\n')
    this._wsClient.send(JSON.stringify(request))

    return promise
  }

  close() {
    this._wsClient.close()
    this._wsClient = null
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
}
