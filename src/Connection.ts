import PubSub from 'pubsub-js'
import logger from './util/logger'
import { EVENTS } from './util/constants'

export default class Connection {
  private _wsClient: any = null

  constructor(public host: string = 'localhost') {
    this.host = `wss://${host}/api-bd-edge`
    // this.host = `wss://${host}`
    this.connect()
  }

  connect() {
    this._wsClient = new WebSocket(this.host)
    this._wsClient.onopen = (event): boolean => PubSub.publish(EVENTS.WS_OPEN, event)
    this._wsClient.onclose = (event): boolean => PubSub.publish(EVENTS.WS_CLOSE, event)
    this._wsClient.onerror = (event): boolean => PubSub.publish(EVENTS.WS_ERROR, event)
    this._wsClient.onmessage = (event): void => {
      const msg: any = JSON.parse(event.data)
      logger.debug('RECV: \n', JSON.stringify(msg, null, 2), '\n')
      if (!PubSub.publish(msg.id, msg)) {
        // If there is not an handler for this message, dispatch an incoming!
        PubSub.publish(EVENTS.WS_MESSAGE, msg)
      }
    }
  }

  send(bladeObj: any): Promise<any> {
    const { request } = bladeObj
    const promise = new Promise((resolve, reject) => {
      PubSub.subscribe(request.id, (msgId, result) => {
        result.hasOwnProperty('error') ? reject(result) : resolve(result)
      })
    })
    logger.debug('SEND: \n', JSON.stringify(request, null, 2), '\n')
    this._wsClient.send(JSON.stringify(request))

    return promise
  }
}
