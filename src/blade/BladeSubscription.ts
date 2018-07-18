import { IBladeSubscriptionRequest } from '../interfaces'
import BaseMessage from './baseMessage'
// import { BLADE_SUBSCRIBE_COMMAND } from '../util/constants'

export default class BladeSubscription extends BaseMessage {
  method: string = 'blade.subscription'

  constructor(params: IBladeSubscriptionRequest['params']) {
    super()
    if (params.hasOwnProperty('auto_create') && !params.auto_create) {
      delete params.auto_create
    }
    if (params.hasOwnProperty('downstream') && !params.downstream) {
      delete params.downstream
    }
    this.buildRequest({ method: this.method, params })
  }
}