import BaseMessage from './baseMessage'

export default class BladeLocate extends BaseMessage {
  method: string = 'blade.locate'

  constructor(params: any) {
    super()
    this.buildRequest({ method: this.method, params })
  }
}