import { v4 as uuidv4 } from 'uuid'
import logger from './util/logger'
import { checkWebSocketHost, destructResponse, safeParseJson, timeoutPromise } from './util/helpers'
import { sessionStorage } from './util/storage/'
import { BladeMethod } from './util/constants'
import { deRegister, register } from './services/Handler'
import { BladeConnect, BladeConnectParams, BladeDisconnectResponse, BladePing, BladePingResponse } from './messages/index'
import { IBladeAuthorization } from './util/interfaces'

type JSONRPCParams = {
  [key: string]: any
}

type JSONRPCResult = {
  [key: string]: any
}

type JSONRPCError = {
  [key: string]: any
}

interface JSONRPCRequest {
  jsonrpc: '2.0'
  id: string
  method: string
  params?: JSONRPCParams
}

interface JSONRPCResponse {
  jsonrpc: '2.0'
  id: string
  result?: JSONRPCResult
  error?: JSONRPCError
}

interface SessionOptions {
  host?: string
  project: string
  token: string
}

interface SessionRequestObject {
  resolve: (value: unknown) => void
  reject: (value: unknown) => void
}

type SessionRequestQueue = {
  resolve: (value: unknown) => void,
  msg: JSONRPCRequest | JSONRPCResponse
}[]

enum WebSocketState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3
}
const DEFAULT_HOST = 'wss://relay.signalwire.com'

export class Session {
  public uuid: string = uuidv4()
  public relayProtocol: string = null

  private _requests = new Map<string, SessionRequestObject>()
  private _requestQueue: SessionRequestQueue = []
  private _socket: WebSocket = null
  private _idle = true
  private _host: string = DEFAULT_HOST
  private _authorization: IBladeAuthorization

  private _pong: boolean = null
  private _keepAliveRequired = true
  private _keepAliveTimeout = null
  private _keepAliveInterval = 15 * 1000

  // abstract WebSocketConstructor: typeof WebSocket
  // abstract validateOptions(): boolean
  // abstract eventHandler(notification: any): void

  constructor(public options: SessionOptions) {
    // if (!this.validateOptions()) {
    //   throw new Error('Invalid init options')
    // }
    if (options.host) {
      this._host = checkWebSocketHost(options.host)
    }
    this._onSocketOpen = this._onSocketOpen.bind(this)
    this._onSocketError = this._onSocketError.bind(this)
    this._onSocketClose = this._onSocketClose.bind(this)
    this._onSocketMessage = this._onSocketMessage.bind(this)

    this.logger.setLevel(this.logger.levels.DEBUG)
  }

  get signature() {
    return this?._authorization.signature
  }

  get logger(): typeof logger {
    return logger
  }

  get connecting() {
    return this._socket?.readyState === WebSocketState.CONNECTING
  }

  get connected() {
    return this._socket?.readyState === WebSocketState.OPEN
  }

  get closing() {
    return this._socket?.readyState === WebSocketState.CLOSING
  }

  get closed() {
    return this._socket?.readyState === WebSocketState.CLOSED
  }

  /**
   * Connect the websocket
   *
   * @return void
   */
  connect(): void {
    /**
     * Return if there is already a _socket instance.
     * This prevents issues if "connect()" is called multiple times.
     */
    if (this._socket) {
      logger.warn('Session already connected.')
      return
    }
    this._socket = new this.WebSocketConstructor(this._host)
    this._socket.onopen = this._onSocketOpen
    this._socket.onclose = this._onSocketClose
    this._socket.onerror = this._onSocketError
    this._socket.onmessage = this._onSocketMessage
  }

  /**
   * Remove subscriptions and calls, close WS connection and remove all session listeners.
   * @return void
   */
  async disconnect() {
    /**
     * Return if there is not a _socket instance or
     * if it's already in closing state.
     */
    if (!this._socket || this.closing) {
      logger.warn('Session not connected or already in closing state.')
      return
    }

    this._socket.close()
    this._socket = null
    // clearTimeout(this._reconnectTimeout)
    // this.subscriptions.clear()
    // this._autoReconnect = false
    // this.relayProtocol = null
    // this._closeConnection()
    // await sessionStorage.removeItem(this.signature)
    // this._executeQueue = []
    // this._detachListeners()
    // this.off(SwEvent.Ready)
    // this.off(SwEvent.Notification)
    // this.off(SwEvent.Error)
  }

  /**
   * Attach a listener to the global session level
   * @return void
   */
  on(eventName: string, callback: Function) {
    register(eventName, callback, this.uuid)
    return this
  }

  /**
   * Detach a listener from the global session level
   * @return void
   */
  off(eventName: string, callback?: Function) {
    deRegister(eventName, callback, this.uuid)
    return this
  }

  /**
   * Send a JSON object to the server.
   * @return Promise that will resolve/reject depending on the server response
   */
   execute(msg: JSONRPCRequest | JSONRPCResponse): Promise<any> { // FIXME: make a RPC interface
    if (this._idle) {
      return new Promise(resolve => this._requestQueue.push({ resolve, msg }))
    }
    if (!this.connected) {
      return new Promise(resolve => {
        this._requestQueue.push({ resolve, msg })
        this.connect()
      })
    }
    let promise: Promise<unknown> = null
    if ('params' in msg) {
      promise = new Promise((resolve, reject) => {
        this._requests.set(msg.id, { resolve, reject })
      })
    } else {
      promise = Promise.resolve()
    }

    const timeoutError = Symbol()
    const timeoutDelay = 10 * 1000

    logger.debug('SEND: \n', JSON.stringify(msg, null, 2), '\n')
    this._socket.send(JSON.stringify(msg))

    return timeoutPromise(promise, timeoutDelay, timeoutError)
      .catch(error => {
        if (error === timeoutError) {
          logger.error('Request Timeout', msg)
          // FIXME: Timeout so close/reconnect
          // this._closeConnection()
        } else {
          throw error
        }
      })
  }

  /**
   * Authenticate with the SignalWire network
   * @return Promise<any>
   */
  async authenticate() {
    try {
      const params: BladeConnectParams = {
        authentication: {
          project: this.options.project,
          jwt_token: this.options.token,
        },
        params: {},
      }

      if (this._relayProtocolIsValid()) {
        params.params.protocol = this.relayProtocol
      } else {
        const prevProtocol = await sessionStorage.getItem(this.signature)
        if (prevProtocol) {
          params.params.protocol = prevProtocol
        }
      }

      const response = await this.execute(BladeConnect(params))
      console.log('Response', response)
    } catch (error) {
      console.error('Auth Error', error)
    }
  }

  protected async _onSocketOpen(event: Event) {
    logger.debug('_onSocketOpen', event)
    this._idle = false
    await this.authenticate()
    this._emptyRequestQueue()
    // this._keepAlive() // TODO: Required or not?
  }

  protected _onSocketError(event: Event) {
    logger.debug('_onSocketError', event)

  }

  protected _onSocketClose(event: CloseEvent) {
    logger.debug('_onSocketClose', event)

  }

  protected _onSocketMessage(event: MessageEvent) {
    const payload: any = safeParseJson(event.data)
    logger.debug('RECV: \n', JSON.stringify(payload, null, 2), '\n')
    if (this._requests.has(payload.id)) {
      const { resolve, reject } = this._requests.get(payload.id)
      this._requests.delete(payload.id)
      const { result, error } = destructResponse(payload)
      return error ? reject(error) : resolve(result)
    }

    switch (payload.method) {
      case BladeMethod.Ping: {
        const response = BladePingResponse(payload.id, payload?.params?.timestamp)
        this.execute(response)
        break
      }
      case BladeMethod.Disconnect: {
        /**
         * Set _idle = true because the server
         * will close the connection soon.
         */
        this._idle = true
        this.execute(BladeDisconnectResponse(payload.id))
        break
      }
      default:
        // If it's not a response, trigger the eventHandler.
        this.eventHandler(payload)
    }
  }

  /**
   * Execute all the queued messages during the idle period.
   * @return void
   */
  private _emptyRequestQueue() {
    this._requestQueue.forEach(({ resolve, msg }) => {
      resolve(this.execute(msg))
    })
    this._requestQueue = []
  }

  /**
   * Execute ping every _keepAliveInterval and close the connection
   * in case of missing "pong" response.
   * @return void
   */
  private _keepAlive() {
    if (this._keepAliveRequired !== true) {
      return
    }
    if (this._pong === false) {
      // TODO: force close the connection
      return // this._closeConnection()
    }
    this._pong = false
    this.execute(BladePing())
      .then(() => this._pong = true)
      .catch(() => this._pong = false)
    this._keepAliveTimeout = setTimeout(() => this._keepAlive(), this._keepAliveInterval)
  }

  /**
   * Check the current relayProtocol against the signature
   * to make sure is still valid.
   * @return boolean
   */
  private _relayProtocolIsValid() {
    return this?.relayProtocol?.split('_')[1] === this.signature
  }
}
