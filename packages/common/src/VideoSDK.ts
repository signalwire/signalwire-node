import { v4 as uuidv4 } from 'uuid'
import logger from './util/logger'
import { Session } from './Session'

export class VideoSDK extends Session {
  WebSocketConstructor = WebSocket

  validateOptions(): boolean {
    throw new Error('validateOptions - Method not implemented')
  }

  eventHandler(notification: any): void {
    logger.debug('VideoSDK eventHandler', notification)
  }

}
