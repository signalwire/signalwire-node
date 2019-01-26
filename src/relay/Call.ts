import logger from '../util/logger'
import SignalWire from '../SignalWire'
import { Execute } from '../messages/Blade'
import { cleanNumber } from '../util/helpers'

export default class Call {
  constructor(
    private session: SignalWire,
    private protocol: string
  ) {
    // this.notificationHandler = this.notificationHandler.bind(this)
  }

  // async begin(from: string, to: string) {
  //   logger.debug('Call')

  // }
}
