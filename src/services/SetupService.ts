import logger from '../util/logger'
import { BladeExecuteRequest } from '../blade/BladeExecute'
import LocateService from './LocateService'

export default class SetupService {
  private _protocol = 'signalwire'
  private _method = 'setup'

  constructor(public session: any, public service: string) { }

  async start() {
    logger.debug(`Search for a responder supporting "${this._protocol}" protocol`)
    const responder_nodeid = await this._pollNodeStore(this._protocol).catch(logger.error) // TODO: Remove logger.error from here
    if (!responder_nodeid) {
      throw new Error(`Provider for protocol "${this._protocol}" not found!`)
    }
    logger.debug(`Responder found: "${responder_nodeid}"`)
    let be = new BladeExecuteRequest({
      requester_nodeid: this.session.nodeid,
      responder_nodeid,
      protocol: this._protocol,
      method: this._method,
      params: {
        service: this.service
      }
    })
    logger.debug('Execute the setup method on this responder', be)
    const bladeObj = await this.session.conn.send(be).catch(logger.error) // TODO: Remove logger.error from here
    logger.debug('Setup response:', bladeObj)
    if (bladeObj === undefined) {
      return false
    }
    let { protocol } = bladeObj.response.result.result

    logger.debug('Need to subscribe to this protocol', protocol)
    await this.session.addSubscription(protocol, ['notifications']).catch(logger.error) // TODO: Remove logger.error from here
    logger.debug('.. and wait for the right netcast...')
    await this._pollNodeStore(protocol).catch(logger.error) // TODO: Remove logger.error from here

    this.session.services[this.service] = protocol
    return true
  }

  private _pollNodeStore(protocol: string): Promise<string> {
    const loop = (resolve, reject) => {
      logger.debug(':: Looking for a node supporting protocol:', protocol)
      let responder_nodeid = this.session.nodeStore.getNodeIdByProtocol(protocol)
      if (responder_nodeid !== null) {
        resolve(responder_nodeid)
      } else {
        // TODO: Add a timeout
        setTimeout(() => loop(resolve, reject), 100)
      }
    }
    return new Promise(loop)
  }
}