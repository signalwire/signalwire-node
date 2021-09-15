import { trigger } from '../../services/Handler'
import { DeepArray, ICallDevice, IDialCallParams, IMakeCallParams } from '../../util/interfaces'
import logger from '../../util/logger'
import Relay from '../Relay'
import Call from './Call'
import { CallNotification } from '../../util/constants/relay'
import { isIDialCallParams, prepareDialDevices } from '../helpers'

export default class Calling extends Relay {
  protected service: string = 'calling'
  private _calls: Call[] = []

  notificationHandler(notification: any) {
    const { event_type, params } = notification
    params.event_type = event_type
    switch (event_type) {
      case CallNotification.Dial:
        return this._onDial(params)
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
      case CallNotification.Tap:
        return this._onTap(params)
      case CallNotification.SendDigits:
        return this._onSendDigits(params)
    }
  }

  newCall(...params: [IDialCallParams] | DeepArray<IMakeCallParams>) {
    let devices: DeepArray<ICallDevice>
    if (params.length === 1 && isIDialCallParams(params[0])) {
      devices = prepareDialDevices(params[0].devices)
    } else {
      const paramsDevices = []
      params.forEach(p => {
        if (!isIDialCallParams(p)) {
          paramsDevices.push(p)
        }
      })
      devices = prepareDialDevices(paramsDevices)
    }
    return new Call(this, { devices })
  }

  async dial(...params: [IDialCallParams] | DeepArray<IMakeCallParams>) {
    const call = this.newCall(...params)
    const result = await call.dial()
    return result
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
    const { call_id, node_id, tag } = params
    const call = this.getCallById(call_id) || this.getCallByTag(tag)
    if (call) {
      if (!call.isMultiDial) {
        if (!call.ready) {
          call.id = call_id
          call.nodeId = node_id
        }
        call._stateChange(params)
      }
    } else if (call_id) {
      new Call(this, params)
    } else {
      logger.debug('\t - Unknown call:', params, '\n\n')
    }
  }

  /**
   * Handle calling.call.dial notification params
   * @param params - Inner params of calling.call.dial notification
   * @return void
   */
  private _onDial(params: any): void {
    const { tag } = params
    const call = this.getCallByTag(tag)
    call._dialChange(params)
  }

  /**
   * Handle calling.call.connect notification params
   * @param params - Inner params of calling.call.connect notification
   * @return void
   */
  private _onConnect(params: any): void {
    const call = this.getCallById(params.call_id)
    if (call) {
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
    trigger(this.session.relayProtocol, call, this._ctxReceiveUniqueId(call.context))
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

  /**
   * Handle calling.call.tap notification params
   * @param params - Inner params of calling.call.tap notification
   * @return void
   */
  private _onTap(params: any): void {
    const call = this.getCallById(params.call_id)
    if (call) {
      call._tapChange(params)
    }
  }

  /**
   * Handle calling.call.send_digits notification params
   * @param params - Inner params of calling.call.send_digits notification
   * @return void
   */
  private _onSendDigits(params: any): void {
    const call = this.getCallById(params.call_id)
    if (call) {
      call._sendDigitsChange(params)
    }
  }
}
