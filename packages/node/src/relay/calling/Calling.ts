import { Execute } from '../../../../common/src/messages/Blade'
import { register, trigger } from '../../../../common/src/services/Handler'
import logger from '../../../../common/src/util/logger'
import Relay from '../Relay'
import Call from './Call'

const _ctxUniqueId = (context: string): string => `ctx:${context}`

export default class Calling extends Relay {
  service = 'calling'
  private _calls: { [callId: string]: Call } = {}

  notificationHandler(notification: any) {
    // logger.warn(`Relay ${this.service} notification on proto ${this._protocol}`, notification)
    const { event_type, timestamp, params } = notification
    switch (event_type) {
      case 'calling.call.state': {
        const { call_id, call_state, peer: { call_id: peerCallId = null } = {} } = params
        const callIds = Object.keys(this._calls)
        if (!callIds.includes(call_id)) {
          throw `Unknown call_id: ${call_id}.`
        }
        if (peerCallId && callIds.includes(peerCallId)) {
          this._calls[call_id].connectedWith = this._calls[peerCallId]
          this._calls[peerCallId].connectedWith = this._calls[call_id]
        }
        trigger(call_id, null, call_state, false)
        break
      }
      case 'calling.call.receive': {
        const call = new Call(this, params)
        trigger(this._protocol, call, _ctxUniqueId(call.context))
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
    register(this._protocol, handler, _ctxUniqueId(context))
  }

  addCall(call: Call) {
    this._calls[call.id] = call
  }
}
