import { makeRPCResponse } from './index'

export const BladeDisconnectResponse = (id: string) => {
  return makeRPCResponse({
    id,
    result: {},
  })
}
