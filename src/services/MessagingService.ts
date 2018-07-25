// import logger from '../util/logger'
import BaseService from './BaseService'
import { BladeExecuteRequest } from '../blade/BladeExecute'

export default class MessagingService extends BaseService {
  static service = 'messaging'

  sendSms(params: any) {
    return this._loadResponderNodeId()
      .then(async responder_nodeid => {
        let { body, from, to, media, onStatusUpdate } = params
        let be = new BladeExecuteRequest({
          requester_nodeid: this.session.nodeid,
          responder_nodeid,
          protocol: this._protocol,
          method: 'send',
          params: {
            message: { body, from: this._cleanNumber(from), to: this._cleanNumber(to), media: media || [] }
          }
        })
        const bladeObj = await this.session.conn.send(be)
        let { result } = bladeObj.response.result // 2 levels of 'result'
        if (typeof onStatusUpdate === 'function') {
          this.session.servicesCallback[result.id] = onStatusUpdate // Cache callback for next notification
        }
        return result
      })
  }

  getMessage(id: string) {
    return this._loadResponderNodeId()
      .then(async responder_nodeid => {
        let be = new BladeExecuteRequest({
          requester_nodeid: this.session.nodeid,
          responder_nodeid,
          protocol: this._protocol,
          method: 'status',
          params: { id }
        })
        const bladeObj = await this.session.conn.send(be)
        let { result } = bladeObj.response.result // 2 levels of 'result'

        return result
      })
  }
}