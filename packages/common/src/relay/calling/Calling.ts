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
    params.event_type = event_type
    switch (event_type) {
      case CallNotification.State:
        return this._onState(params)
      case CallNotification.Receive:
        return this._onReceive(params)
      case CallNotification.Connect:
        return this._onConnect(params)
      case CallNotification.Record:
        return this._onRecord(params)
      case CallNotification.Play:
        return this._onPlay(params)
      case CallNotification.Collect:
        return this._onCollect(params)
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

  /**
   * Handle calling.call.state notification params
   * @param params - Inner params of calling.call.state notification
   * @return void
   */
  private _onState(params: any): void {
    const { call_id, node_id, call_state, tag, peer } = params
    const call = this.getCallById(call_id) || this.getCallByTag(tag)
    if (call) {
      if (!call.ready) {
        call.id = call_id
        call.nodeId = node_id
      }
      call._stateChange(call_state)
    } else if (call_id && peer) {
      const peerCall = new Call(this, params)
    } else {
      logger.error('\t - Unknown call:', params, '\n\n')
    }
  }

  /**
   * Handle calling.call.connect notification params
   * @param params - Inner params of calling.call.connect notification
   * @return void
   */
  private _onConnect(params: any): void {
    const { call_id, connect_state, peer } = params
    const call = this.getCallById(call_id)
    if (call) {
      if (peer) {
        call.setOptions({ peer })
      }
      call._connectStateChange(connect_state)
    }
  }

  /**
   * Handle calling.call.receive notification params
   * @param params - Inner params of calling.call.receive notification
   * @return void
   */
  private _onReceive(params: any): void {
    const call = new Call(this, params)
    trigger(this.protocol, call, _ctxUniqueId(call.context))
  }

  /**
   * Handle calling.call.record notification params
   * @param params - Inner params of calling.call.record notification
   * @return void
   */
  private _onRecord(params: any): void {
    const { call_id, state } = params
    const call = this.getCallById(call_id)
    if (call) {
      call._addControlParams(params)
      trigger(call_id, params, `record.${state}`)
    }
  }

  /**
   * Handle calling.call.play notification params
   * @param params - Inner params of calling.call.play notification
   * @return void
   */
  private _onPlay(params: any): void {
    const { call_id, state } = params
    const call = this.getCallById(call_id)
    if (call) {
      call._addControlParams(params)
      trigger(call_id, params, `play.${state}`)
    }
  }

  /**
   * Handle calling.call.collect notification params
   * @param params - Inner params of calling.call.collect notification
   * @return void
   */
  private _onCollect(params: any): void {
    const { call_id } = params
    const call = this.getCallById(call_id)
    if (call) {
      call._addControlParams(params)
      trigger(call_id, params, 'collect')
    }
  }
}
