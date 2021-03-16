import { makeRPCRequest } from './index'

type BladePingParams = {}

export const BladePing = (params: BladePingParams = {}) => {
  return makeRPCRequest({
    method: 'blade.ping',
    params,
  })
}
