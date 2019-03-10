import { Execute } from '../../messages/Blade'
import { isFunction } from '../../util/helpers'
import { register, trigger } from '../../services/Handler'
import { ICallDevice, IMakeCallParams } from '../../util/interfaces'
import logger from '../../util/logger'
import Relay from '../Relay'
import Call from './Call'
import { DEFAULT_CALL_TIMEOUT } from '../../util/constants/relay'

const _ctxUniqueId = (context: string): string => `ctx:${context}`

export default class Calling extends Relay {
  private _calls: Call[] = []

  get service() {
    return 'calling'
  }

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
        trigger(this.protocol, call, _ctxUniqueId(call.context))
        break
      }
      case 'calling.call.connect': {
        const { call_id, connect_state, peer } = params
        const call = this.getCallById(call_id)
        if (!call) {
          logger.error('Unknown call:', params)
          return
        }
        if (peer) {
          call.setOptions({ peer })
        }
        trigger(call_id, call, connect_state)
        break
      }
    }
  }

  async makeCall(params: IMakeCallParams) {
    await this.Ready
    const { type, from: from_number, to: to_number, timeout = DEFAULT_CALL_TIMEOUT } = params
    if (!type || !from_number || !to_number || !timeout) {
      throw new Error(`Invalid parameters for 'makeCall'.`)
    }
    const device: ICallDevice = { type, params: { from_number, to_number, timeout } }
    return new Call(this, { device })
  }

  async onInbound(context: string, handler: Function) {
    await this.Ready
    if (!context || !isFunction(handler)) {
      throw new Error(`Invalid parameters for 'onInbound'.`)
    }
    const msg = new Execute({
      protocol: this.protocol,
      method: 'call.receive',
      params: { context }
    })

    const result = await this.session.execute(msg).catch(error => error)
    logger.debug('Register onInbound call:', result)
    register(this.protocol, handler, _ctxUniqueId(context))
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

  protected _disconnect() {
    this._calls.forEach(async call => await call.hangup())
    super._disconnect()
  }
}
