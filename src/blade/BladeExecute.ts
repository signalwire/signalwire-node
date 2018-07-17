import { IBladeExecuteRequest, IBladeExecuteResult } from '../interfaces'
import BaseMessage from './baseMessage'

class BladeExecuteRequest extends BaseMessage implements IBladeExecuteRequest {
  method: string = 'blade.execute'

  constructor(public params: IBladeExecuteRequest['params']) {
    super()
  }
}

class BladeExecuteResponse extends BaseMessage implements IBladeExecuteResult {
  constructor(public result: IBladeExecuteResult['result']) {
    super()
  }
}

export { BladeExecuteRequest, BladeExecuteResponse }