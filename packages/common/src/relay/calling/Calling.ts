import { Execute } from '../../messages/Blade'
import { isFunction } from '../../util/helpers'
import { register, trigger } from '../../services/Handler'
import { ICallDevice, IMakeCallParams } from '../../util/interfaces'
import logger from '../../util/logger'
import Relay from '../Relay'
import Call from './Call'
import { DEFAULT_CALL_TIMEOUT, CallNotification } from '../../util/constants/relay'

const _ctxUniqueId = (context: string): string => `calling.ctx.${context}`

export default class Calling extends Relay {
  private _calls: Call[] = []

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
      case CallNotification.Fax:
        return this._onFax(params)
      case CallNotification.Detect:
        return this._onDetect(params)
    }
  }

  newCall(params: IMakeCallParams) {
    const { type, from: from_number, to: to_number, timeout = DEFAULT_CALL_TIMEOUT } = params
    if (!type || !from_number || !to_number || !timeout) {
      throw new TypeError(`Invalid parameters to create a new Call.`)
    }
    const device: ICallDevice = { type, params: { from_number, to_number, timeout } }
    return new Call(this, { device })
  }

  async dial(params: IMakeCallParams) {
    const { type, from: from_number, to: to_number, timeout = DEFAULT_CALL_TIMEOUT } = params
    if (!type || !from_number || !to_number || !timeout) {
      throw new TypeError(`Invalid parameters to create a new Call.`)
    }
    const device: ICallDevice = { type, params: { from_number, to_number, timeout } }
    const call = new Call(this, { device })

    const result = await call.dial()
    return result
  }

  async onInbound(contexts: string | string[], handler: Function) {
    if (typeof contexts === 'string') { // backwards compat: force to string[]
      contexts = [contexts]
    }
    if (!contexts.length || !isFunction(handler)) {
      logger.warn('Invalid parameters for calling onInbound. "contexts" and "handler" required.')
      return
    }
    const msg = new Execute({
      protocol: this.session.relayProtocol,
      method: 'call.receive',
      params: { contexts }
    })

    const response: any = await this.session.execute(msg)
    contexts.forEach(context => register(this.session.relayProtocol, handler, _ctxUniqueId(context)))
    logger.info(response.message)
    return response
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

  /**
   * Handle calling.call.state notification params
   * @param params - Inner params of calling.call.state notification
   * @return void
   */
  private _onState(params: any): void {
    const { call_id, node_id, tag, peer } = params
    const call = this.getCallById(call_id) || this.getCallByTag(tag)
    if (call) {
      if (!call.ready) {
        call.id = call_id
        call.nodeId = node_id
      }
      call._stateChange(params)
    } else if (call_id && peer) {
      const peerCall = new Call(this, params)
    } else {
      logger.debug('\t - Unknown call:', params, '\n\n')
    }
  }

  /**
   * Handle calling.call.connect notification params
   * @param params - Inner params of calling.call.connect notification
   * @return void
   */
  private _onConnect(params: any): void {
    const { call_id, peer } = params
    const call = this.getCallById(call_id)
    if (call) {
      if (peer) {
        call.setOptions({ peer })
      }
      call._connectChange(params)
    }
  }

  /**
   * Handle calling.call.receive notification params
   * @param params - Inner params of calling.call.receive notification
   * @return void
   */
  private _onReceive(params: any): void {
    const call = new Call(this, params)
    trigger(this.session.relayProtocol, call, _ctxUniqueId(call.context))
  }

  /**
   * Handle calling.call.record notification params
   * @param params - Inner params of calling.call.record notification
   * @return void
   */
  private _onRecord(params: any): void {
    const call = this.getCallById(params.call_id)
    if (call) {
      call._recordChange(params)
    }
  }

  /**
   * Handle calling.call.play notification params
   * @param params - Inner params of calling.call.play notification
   * @return void
   */
  private _onPlay(params: any): void {
    const call = this.getCallById(params.call_id)
    if (call) {
      call._playChange(params)
    }
  }

  /**
   * Handle calling.call.collect notification params
   * @param params - Inner params of calling.call.collect notification
   * @return void
   */
  private _onCollect(params: any): void {
    const call = this.getCallById(params.call_id)
    if (call) {
      call._collectChange(params)
    }
  }

  /**
   * Handle calling.call.fax notification params
   * @param params - Inner params of calling.call.fax notification
   * @return void
   */
  private _onFax(params: any): void {
    const call = this.getCallById(params.call_id)
    if (call) {
      call._faxChange(params)
    }
  }

  /**
   * Handle calling.call.detect notification params
   * @param params - Inner params of calling.call.detect notification
   * @return void
   */
  private _onDetect(params: any): void {
    const call = this.getCallById(params.call_id)
    if (call) {
      call._detectChange(params)
    }
  }
}
