import { Execute } from '../../messages/Blade'
import { isFunction } from '../../util/helpers'
import { register, trigger } from '../../services/Handler'
import { ICallDevice, IMakeCallParams } from '../../util/interfaces'
import logger from '../../util/logger'
import Relay from '../Relay'
import Call from './Call'
import { DEFAULT_CALL_TIMEOUT, CallNotification } from '../../util/constants/relay'

const _ctxUniqueId = (context: string): string => `ctx:${context}`

export default class Calling extends Relay {
  private _calls: Call[] = []

  get service() {
    return 'calling'
  }

  notificationHandler(notification: any) {
    const { event_type, params } = notification
    switch (event_type) {
      case CallNotification.State: {
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
      case CallNotification.Receive: {
        const call = new Call(this, params)
        trigger(this.protocol, call, _ctxUniqueId(call.context))
        break
      }
      case CallNotification.Connect: {
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
      case CallNotification.Record: {
        const { call_id, state } = params
        const call = this.getCallById(call_id)
        if (!call) {
          logger.error('Unknown call:', params)
          return
        }
        params.event_type = event_type
        call._addControlParams(params)
        trigger(call_id, params, `record.${state}`)
        break
      }
    }
  }

  async newCall(params: IMakeCallParams) {
    await this.Ready
    const { type, from: from_number, to: to_number, timeout = DEFAULT_CALL_TIMEOUT } = params
    if (!type || !from_number || !to_number || !timeout) {
      throw new Error(`Invalid parameters for 'newCall'.`)
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

    await this.session.execute(msg)
    register(this.protocol, handler, _ctxUniqueId(context))
  }

  addCall(call: Call): void {
    this._calls.push(call)
  }

  removeCall(callToRemove: Call): void {
    const index = this._calls.findIndex(call => callToRemove == call)
    if (index >= 0) {
      this._calls.splice(index, 1)
    }
  }

  getCallById(id: string): Call {
    return this._calls.find(call => call.id === id)
  }

  getCallByTag(tag: string): Call {
    return this._calls.find(call => call.tag === tag)
  }

  protected _disconnect() {
    this._calls.forEach(async call => {
      if (call.ready) {
        await call.hangup().catch(logger.warn)
      }
    })
    super._disconnect()
  }
}
