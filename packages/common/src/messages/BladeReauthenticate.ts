import { makeRPCRequest } from './index'
import { BladeMethod } from '../util/constants'

type BladeReauthenticateParams = { project: string, jwt_token: string }

export const BladeReauthenticate = (authentication: BladeReauthenticateParams) => {
  return makeRPCRequest({
    method: BladeMethod.Reauthenticate,
    params: {
      authentication,
    }
  })
}
