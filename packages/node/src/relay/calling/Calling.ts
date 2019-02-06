import Relay from '../Relay'
import Call from './Call'
import logger from '../../../../common/src/util/logger'
import { Execute } from '../../../../common/src/messages/Blade'
import { trigger, register } from '../../../../common/src/services/Handler'

export default class Calling extends Relay {
  service = 'calling'
  private _inboundUniqueId = 'inbound'

  notificationHandler(notification: any) {
    // logger.warn(`Relay ${this.service} notification on proto ${this._protocol}`, notification)
    const { event_type, timestamp, params } = notification
    switch (event_type) {
      case 'calling.call.state': {
        const { call_id, call_state, node_id } = params
        trigger(call_id, null, call_state, false)
        break
      }
      case 'calling.call.receive': {
        const call = new Call(this, params)
        trigger(this._protocol, call, this._inboundUniqueId)
        break
      }
      case 'calling.call.connect':
        break
    }
  }

  async makeCall(from_number: string, to_number: string) {
    await this.setup()

    return new Call(this, { from_number, to_number })
  }

  async onInbound(context: string, handler: Function) {
    await this.setup()

    const msg = new Execute({
      protocol: this.protocol,
      method: 'call.receive',
      params: { context }
    })

    const result = await this.session.execute(msg).catch(error => error)
    logger.debug('Register onInbound call:', result)
    register(this._protocol, handler, this._inboundUniqueId)
  }
}
