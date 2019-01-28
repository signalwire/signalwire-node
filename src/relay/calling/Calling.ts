// import logger from '../util/logger'
import Relay from '../Relay'
import { PhoneCall } from './Call';

export default class Calling extends Relay {
  service = 'calling'

  async makeCall(from: string, to: string) {
    await this.setup()
    return new PhoneCall(this, { from, to })
  }
}
