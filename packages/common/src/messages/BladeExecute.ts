import { makeRPCRequest } from './index'
import { BladeMethod } from '../util/constants'

type BladeExecuteParams = {
  protocol: string,
  method: string,
  params?: {
    [key: string]: any
  }
}

export const BladeExecute = (params: BladeExecuteParams) => {
  return makeRPCRequest({
    method: BladeMethod.Execute,
    params,
  })
}
