// import logger from '../util/logger'
import BaseService from './BaseService'
import { BladeExecuteRequest } from '../blade/BladeExecute'

export default class CallingService extends BaseService {
  static service = 'calling'

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
        let { callId: channel, what: what, gender } = params
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
}
