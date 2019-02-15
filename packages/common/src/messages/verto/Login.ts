import BaseMessage from '../BaseMessage'

class Login extends BaseMessage {
  method: string = 'login'

  constructor(login: string, passwd: string, sessionid: string, userVariables: Object = {}) {
    super()

    // TODO: handle loginParams && userVariables
    const params: any = { login, passwd, userVariables, loginParams: {} }
    if (sessionid) {
      params.sessid = sessionid
    }
    this.buildRequest({ method: this.method, params })
  }
}

export { Login }
