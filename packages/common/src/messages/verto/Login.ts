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
  resume?: any
}

class Login extends BaseRequest {
  method: string = 'login'

  constructor({ login, passwd, sessionid, userVariables = {}, loginParams = {}, callIds = [], resume }: LoginOptions) {
    super()

    const params: any = { login, passwd, userVariables, loginParams }
    if (sessionid) {
      params.sessid = sessionid
    }
    if (callIds?.length) {
      params.callIds = callIds
    }
    if (resume) {
      params.resume = resume
    }
    this.buildRequest({ method: this.method, params })
  }
}

export { Login }
