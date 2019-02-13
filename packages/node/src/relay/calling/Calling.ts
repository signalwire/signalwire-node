import { Execute } from '../../../../common/src/messages/Blade'
import { cleanNumber } from '../../../../common/src/util/helpers'
import { register, trigger } from '../../../../common/src/services/Handler'
import { ICallDevice } from '../../../../common/src/util/interfaces'
import logger from '../../../../common/src/util/logger'
import { detectCallType } from '../helpers'
import Relay from '../Relay'
import Call from './Call'

const _ctxUniqueId = (context: string): string => `ctx:${context}`

export default class Calling extends Relay {
  service = 'calling'
  private _calls: { [callId: string]: Call } = {}

  notificationHandler(notification: any) {
    const { event_type, params } = notification
    switch (event_type) {
      case 'calling.call.state': {
        const { call_id, call_state } = params
        if (!this.callExists(call_id)) {
          this._calls[call_id] = new Call(this, params)
          return
        }
        trigger(call_id, this.getCall(call_id), call_state, false)
        break
      }
      case 'calling.call.receive': {
        const call = new Call(this, params)
        trigger(this._protocol, call, _ctxUniqueId(call.context))
        break
      }
      case 'calling.call.connect': {
        const { call_id, connect_state } = params
        trigger(call_id, this.getCall(call_id), connect_state)
        break
      }
    }
  }

  async makeCall(from: string, to: string, timeout: number = 30) {
    await this.setup()
    const device: ICallDevice = {
      type: detectCallType(to),
      params: {
        from_number: cleanNumber(from),
        to_number: cleanNumber(to),
        timeout: Number(timeout)
      }
    }
    return new Call(this, { device })
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

  getCall(callId: string) {
    return this._calls[callId]
  }

  callExists(callId: string) {
    return Object.keys(this._calls).includes(callId)
  }
}
