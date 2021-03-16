import { makeRPCRequest } from './index'

type BladeReauthenticateParams = { project: string, jwt_token: string }

export const BladeReauthenticate = (authentication: BladeReauthenticateParams) => {
  return makeRPCRequest({
    method: 'blade.reauthenticate',
    params: {
      authentication,
    }
  })
}
