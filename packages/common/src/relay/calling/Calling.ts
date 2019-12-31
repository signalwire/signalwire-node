import { trigger } from '../../services/Handler'
import { IMakeCallParams, DeepArray, IDevice } from './interfaces'
import logger from '../../util/logger'
import Relay from '../Relay'
import Call from './Call'
import { Notification } from './constants'
import { prepareDevices } from '../helpers'

export default class Calling extends Relay {
  protected service: string = 'calling'
  private _calls: Call[] = []

  notificationHandler(notification: any) {
    const { event_type, params } = notification
    params.event_type = event_type
    switch (event_type) {
      case Notification.State:
        return this._onState(params)
      case Notification.Receive:
        return this._onReceive(params)
      case Notification.Connect:
        return this._onConnect(params)
      case Notification.Record:
        return this._onRecord(params)
      case Notification.Play:
        return this._onPlay(params)
      case Notification.Collect:
        return this._onCollect(params)
      case Notification.Fax:
        return this._onFax(params)
      case Notification.Detect:
        return this._onDetect(params)
      case Notification.Tap:
        return this._onTap(params)
      case Notification.SendDigits:
        return this._onSendDigits(params)
    }
  }

  newCall(params: (IMakeCallParams | DeepArray<IMakeCallParams>)) {
    // backwards compatibility
    const tmp = params instanceof Array ? params : [params]
    const targets: DeepArray<IDevice> = prepareDevices(tmp)
    return new Call(this, { targets })
  }

  dial(params: (IMakeCallParams | DeepArray<IMakeCallParams>)) {
    // backwards compatibility
    const tmp = params instanceof Array ? params : [params]
    const targets: DeepArray<IDevice> = prepareDevices(tmp)
    const call = new Call(this, { targets })
    return call.dial()
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
