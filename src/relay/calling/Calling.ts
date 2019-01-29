// import logger from '../util/logger'
import Relay from '../Relay'
import { PhoneCall } from './Call';
import logger from '../../util/logger';
import { Execute } from '../../messages/Blade';

export default class Calling extends Relay {
  service = 'calling'

  async makeCall(from: string, to: string) {
    // await this.setup()

    return new PhoneCall(this, { from, to })
  }

  async onInbound(context: string, handler: Function) {
    // await this.setup()

    const msg = new Execute({
      protocol: this.protocol,
      method: 'call.receive',
      params: { context }
    })

    const result = await this.session.execute(msg).catch(error => error)
    logger.debug('Register onInbound call:', result)
  }
}
