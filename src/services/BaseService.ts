import logger from '../util/logger'
import SetupService from './SetupService'

export default abstract class BaseService {
  static service: string = ''
  protected _protocol: string = ''

  constructor(public session: any) {
    const service = this.constructor['service']
    if (!session.services.hasOwnProperty(service)) {
      throw new Error(`${this.constructor.name} hasnt been setup. Call static method "setup" first.`)
    }
    this._protocol = this.session.services[service]
  }

  static async setup(session: any) {
    const service = this.service
    return new Promise(function (resolve, reject) {
      if (session.services.hasOwnProperty(service)) {
        resolve(true)
      } else {
        const setup = new SetupService(session, service).start()
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

  protected _cleanNumber(num: string) {
    let tmp = num.replace(/\D/g, '')
    if (!/^1/.test(tmp)) {
      tmp = `1${tmp}`
    }
    return `+${tmp}`
  }

  protected async _loadResponderNodeId(): Promise<any> {
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