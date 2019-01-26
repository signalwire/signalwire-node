import logger from '../util/logger'
import Relay from './Relay'
import { Execute } from '../messages/Blade'
import { cleanNumber } from '../util/helpers'

export default class Calling extends Relay {
  service = 'calling'

  async makeCall(from: string, to: string) {
    await this.setup()

    const msg = new Execute({
      protocol: this.protocol,
      method: 'call.begin',
      params: {
        type: 'phone',
        params: {
          from_number: cleanNumber(from), to_number: cleanNumber(to)
        }
      }
    })

    return this.session.execute(msg)
  }
}
