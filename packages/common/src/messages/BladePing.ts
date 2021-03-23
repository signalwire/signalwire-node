import { makeRPCRequest } from './index'

export const BladePing = () => {
  return makeRPCRequest({
    method: 'blade.ping',
    params: {
      timestamp: Date.now() / 1000,
    },
  })
}
