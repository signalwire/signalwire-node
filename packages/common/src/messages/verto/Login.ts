import BaseRequest from './BaseRequest'

type LoginOptions = {
  login: string
  passwd: string
  sessionid?: string
  userVariables?: {
    [key: string]: any
  }
  loginParams?: {
    [key: string]: any
  }
  callIds?: string[]
}

class Login extends BaseRequest {
  method: string = 'login'

  constructor({ login, passwd, sessionid, userVariables = {}, loginParams = {}, callIds = [] }: LoginOptions) {
    super()

    const params: any = { login, passwd, userVariables, loginParams }
    if (sessionid) {
      params.sessid = sessionid
    }
    if (callIds?.length) {
      params.callIds = callIds
    }
    this.buildRequest({ method: this.method, params })
  }
}

export { Login }
