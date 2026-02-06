import BaseMessage from '../BaseMessage'
import logger from '../../util/logger'
class Ping extends BaseMessage {
  method: string = 'blade.ping'

  constructor() {
    super()
    this.buildRequest({
      method: this.method, params: {
        dialogParams: {
          userVariable: {
          "log_dump": logger.flush()
        }
      }
    } })
  }
}

export { Ping }
