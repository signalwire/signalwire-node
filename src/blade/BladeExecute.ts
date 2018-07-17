import { IBladeExecuteRequest, IBladeExecuteResult } from '../interfaces'
import BaseMessage from './baseMessage'

class BladeExecuteRequest extends BaseMessage {
  method: string = 'blade.execute'

  constructor(public params: IBladeExecuteRequest['params']) {
    super()

    this.buildRequest({ method: this.method, params })
  }
}

class BladeExecuteResponse extends BaseMessage {
  constructor(public result: IBladeExecuteResult['result']) {
    super()

    this.buildRequest({ result })
  }
}

export { BladeExecuteRequest, BladeExecuteResponse }