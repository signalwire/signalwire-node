import { v4 as uuidv4 } from 'uuid'

type MakeRPCRequestParams = {
  method: string, // TODO: use enum
  params: { // TODO: use list of types?
    [key: string]: any
  }
}
export const makeRPCRequest = (params: MakeRPCRequestParams) => {
  return {
    jsonrpc: '2.0',
    id: uuidv4(),
    ...params,
  }
}

export * from './BladeConnect'
export * from './BladeReauthenticate'
export * from './BladePing'
export * from './BladeExecute'