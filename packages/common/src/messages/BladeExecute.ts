import { makeRPCRequest } from './index'

type BladeExecuteParams = {
  protocol: string,
  method: string,
  params?: {
    [key: string]: any
  }
}

export const BladeExecute = (params: BladeExecuteParams) => {
  return makeRPCRequest({
    method: 'blade.execute',
    params,
  })
}
