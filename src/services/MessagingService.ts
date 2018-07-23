import logger from '../util/logger'
import { BladeExecuteRequest } from '../blade/BladeExecute'
import LocateService from './LocateService'
import SetupService from './SetupService'

export default class MessagingService {
  static service = 'messaging'
  private _protocol: string = ''

  constructor(public session: any) {
    if (!session.services.hasOwnProperty(MessagingService.service)) {
      throw new Error('MessagingService hasnt been setup. Call static method "setup" first.')
    }
    this._protocol = this.session.services[MessagingService.service]
  }

  static async setup(session: any) {
    return new Promise(function(resolve, reject){
      if (session.services.hasOwnProperty(MessagingService.service)) {
        resolve(true)
      } else {
        const setup = new SetupService(session, MessagingService.service).start()
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

  statusSms(id: string) {
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

  private _cleanNumber(num: string) {
    let tmp = num.replace(/\D/g, '')
    if (!/^1/.test(tmp)) {
      tmp = `1${tmp}`
    }
    return `+${tmp}`
  }

  private async _loadResponderNodeId(): Promise<any> {
    let responder_nodeid = this.session.nodeStore.getNodeIdByProtocol(this._protocol)
    if (responder_nodeid === null) {
      responder_nodeid = await new LocateService(this.session).protocol(this._protocol)
    }
    if (responder_nodeid === null) {
      throw new Error(`Provider for protocol "${this._protocol}" not found.`)
    }
    return responder_nodeid
  }
}