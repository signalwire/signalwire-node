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
}

class Login extends BaseRequest {
  method: string = 'login'

  constructor({ login, passwd, sessionid, userVariables = {}, loginParams = {} }: LoginOptions) {
    super()

    const params: any = { login, passwd, userVariables, loginParams }
    if (sessionid) {
      params.sessid = sessionid
    }
    this.buildRequest({ method: this.method, params })
  }
}

export { Login }
