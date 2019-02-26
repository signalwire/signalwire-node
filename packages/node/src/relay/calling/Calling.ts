import { Execute } from '../../../../common/src/messages/Blade'
import { isFunction } from '../../../../common/src/util/helpers'
import { register, trigger } from '../../../../common/src/services/Handler'
import { ICallDevice, IMakeCallParams } from '../../../../common/src/util/interfaces'
import logger from '../../../../common/src/util/logger'
import { cleanCallingParams } from '../helpers'
import Relay from '../Relay'
import Call from './Call'

const _ctxUniqueId = (context: string): string => `ctx:${context}`

export default class Calling extends Relay {
  service = 'calling'
  private _calls: Call[] = []

  notificationHandler(notification: any) {
    const { event_type, params } = notification
    switch (event_type) {
      case 'calling.call.state': {
        const { call_id, node_id, call_state, tag, peer } = params
        let call = this.getCallById(call_id)
        if (call) {
          return trigger(call_id, call, call_state, false)
        }
        call = this.getCallByTag(tag)
        if (call) {
          if (!call.ready) {
            call.setup(call_id, node_id)
          }
          return trigger(call_id, call, call_state, false)
        }
        if (call_id && peer) {
          call = new Call(this, params)
          return
        }
        logger.error('\t - Unknown call:', params, '\n\n')
        break
      }
      case 'calling.call.receive': {
        const call = new Call(this, params)
        trigger(this._protocol, call, _ctxUniqueId(call.context))
        break
      }
      case 'calling.call.connect': {
        const { call_id, connect_state, peer } = params
        const call = this.getCallById(call_id)
        call.setOptions({ peer } )
        trigger(call_id, call, connect_state)
        break
      }
    }
  }

  async makeCall(params: IMakeCallParams) {
    const { type, from_number, to_number, timeout } = cleanCallingParams(params)
    if (!type || !from_number || !to_number || !timeout) {
      throw new Error(`Invalid parameters for 'makeCall'.`)
    }
    await this.setup()
    const device: ICallDevice = { type, params: { from_number, to_number, timeout } }
    return new Call(this, { device })
  }

  async onInbound(context: string, handler: Function) {
    if (!context || !isFunction(handler)) {
      throw new Error(`Invalid parameters for 'onInbound'.`)
    }
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

  addCall(call: Call): void {
    this._calls.push(call)
  }

  getCallById(id: string): Call {
    return this._calls.find(call => call.id === id)
  }

  getCallByTag(tag: string): Call {
    return this._calls.find(call => call.tag === tag)
  }
}
