import logger from '../util/logger'
import { BladeExecuteRequest } from '../blade/BladeExecute'
import SetupService from './SetupService'

export default class CallingService {
  static service = 'calling'
  private _protocol: string = ''

  constructor(public session: any) {
    if (!session.services.hasOwnProperty(CallingService.service)) {
      throw new Error('CallingService hasnt been setup. Call static method "setup" first.')
    }
    this._protocol = this.session.services[CallingService.service]
  }

  static async setup(session: any) {
    return new Promise(function (resolve, reject) {
      if (session.services.hasOwnProperty(CallingService.service)) {
        resolve(true)
      } else {
        const setup = new SetupService(session, CallingService.service).start()
          .then(result => {
            result ? resolve(true) : reject('Something wrong')
          })
          .catch(error => {
            logger.error('SetupService error: ', error)
            reject('Something wrong')
          })
      }
    })
  }

  call(params: any) {
    return this._loadResponderNodeId()
      .then(async responder_nodeid => {
        let { from, to } = params
        let be = new BladeExecuteRequest({
          requester_nodeid: this.session.nodeid,
          responder_nodeid,
          protocol: this._protocol,
          method: 'call',
          params: { from: this._cleanNumber(from), to: this._cleanNumber(to), retries: 5, sleep_between_retries: 10000 }
        })
        const bladeObj = await this.session.conn.send(be)
        let { result } = bladeObj.response.result // 2 levels of 'result'
        return result
      })
  }

  hangup(params: any) {
    let { callId: channel } = params
    return this._executeMethodOnChannel('disconnect', channel)
  }

  play(params: any) {
    return this._loadResponderNodeId()
      .then(async responder_nodeid => {
        let { callId: channel, url } = params
        let be = new BladeExecuteRequest({
          requester_nodeid: this.session.nodeid,
          responder_nodeid,
          protocol: this._protocol,
          method: 'play',
          params: { channel, url }
        })
        const bladeObj = await this.session.conn.send(be)
        let { result } = bladeObj.response.result // 2 levels of 'result'
        return result === null
      })
  }

  sendDtmf(params: any) {
    return this._loadResponderNodeId()
      .then(async responder_nodeid => {
        let { callId: channel, digits, digit_duration } = params
        digit_duration = digit_duration || 80
        let be = new BladeExecuteRequest({
          requester_nodeid: this.session.nodeid,
          responder_nodeid,
          protocol: this._protocol,
          method: 'play_digits',
          params: { channel, digits, digit_duration }
        })
        const bladeObj = await this.session.conn.send(be)
        let { result } = bladeObj.response.result // 2 levels of 'result'
        return result === null
      })
  }

  say(params: any) {
    return this._loadResponderNodeId()
      .then(async responder_nodeid => {
        let { callId: channel, whatToSay: what, gender } = params
        gender = gender || 'other'
        let be = new BladeExecuteRequest({
          requester_nodeid: this.session.nodeid,
          responder_nodeid,
          protocol: this._protocol,
          method: 'say',
          params: { channel, what, gender }
        })
        const bladeObj = await this.session.conn.send(be)
        let { result } = bladeObj.response.result // 2 levels of 'result'
        return result === null
      })
  }

  answer(params: any) {
    let { callId: channel } = params
    return this._executeMethodOnChannel('answer', channel)
  }

  collectDigits(params: any) {
    let { callId: channel } = params
    return this._executeMethodOnChannel('collect_digits', channel)
  }

  collectSpeech(params: any) {
    let { callId: channel } = params
    return this._executeMethodOnChannel('collect_speech', channel)
  }

  private _executeMethodOnChannel(method: string, channel: string) {
    return this._loadResponderNodeId()
      .then(async responder_nodeid => {
        let be = new BladeExecuteRequest({
          requester_nodeid: this.session.nodeid,
          responder_nodeid,
          protocol: this._protocol,
          method,
          params: { channel }
        })
        const bladeObj = await this.session.conn.send(be)
        let { result } = bladeObj.response.result // 2 levels of 'result'
        return result === null
      })
  }

  private _cleanNumber(num: string) {
    let tmp = num.replace(/\D/g, '')
    if (!/^1/.test(tmp)) {
      tmp = `1${tmp}`
    }
    return `+${tmp}`
  }

  private async _loadResponderNodeId(): Promise<any> {
    let responder_nodeid = this.session.nodeStore.getNodeIdByProtocol(this._protocol)
    // if (responder_nodeid === null) {
    //   responder_nodeid = await new LocateService(this.session).protocol(this._protocol)
    // }
    if (responder_nodeid === null) {
      throw new Error(`Provider for protocol "${this._protocol}" not found.`)
    }
    return responder_nodeid
  }
}