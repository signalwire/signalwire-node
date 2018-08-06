import logger from '../util/logger'
import { BladeExecuteRequest } from '../blade/BladeExecute'

export default class SetupService {
  private _protocol = 'signalwire'
  private _method = 'setup'

  constructor(public session: any, public service: string) { }

  async start() {
    const responder_nodeid = await this._pollNodeStore(this._protocol).catch(logger.error) // TODO: Remove logger.error from here
    if (!responder_nodeid) {
      throw new Error(`Provider for protocol "${this._protocol}" not found!`)
    }
    let be = new BladeExecuteRequest({
      requester_nodeid: this.session.nodeid,
      responder_nodeid,
      protocol: this._protocol,
      method: this._method,
      params: {
        service: this.service
      }
    })
    logger.debug('Execute the setup method for', this.service)
    const bladeObj = await this.session.conn.send(be).catch(logger.error) // TODO: Remove logger.error from here
    if (bladeObj === undefined) {
      return false
    }
    let { protocol } = bladeObj.response.result.result

    logger.debug('Wait for the right netcast...')
    const nodeid = await this._pollNodeStore(protocol)

    logger.debug('Add Subscription to ', protocol)
    const sub = await this.session.addSubscription(protocol, ['notifications']).catch(logger.error) // TODO: Remove logger.error from here

    if (sub && nodeid) {
      this.session.services[this.service] = protocol
      return true
    }
    return false
  }

  private _pollNodeStore(protocol: string): Promise<string> {
    var startTime = new Date().getTime()
    var waitFor = 10 * 1000
    const loop = (resolve, reject) => {
      logger.debug(':: Looking for a node supporting protocol:', protocol)
      let responder_nodeid = this.session.nodeStore.getNodeIdByProtocol(protocol)
      if (responder_nodeid !== null) {
        resolve(responder_nodeid)
      } else if (waitFor > (new Date().getTime() - startTime)) {
        setTimeout(() => loop(resolve, reject), 100)
      } else {
        reject('Timeout')
      }
    }
    return new Promise(loop)
  }
}