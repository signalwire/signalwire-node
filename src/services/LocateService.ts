import logger from '../util/logger'
import BladeLocate from '../blade/BladeLocate'

export default class LocateService {
  constructor(public session: any) {}

  protocol(protocol: string): Promise<string> {
    let params = {
      requester_nodeid: this.session.nodeid,
      responder_nodeid: this.session.master_nodeid,
      protocol,
      command: 1
    }
    return this.session.conn.send(new BladeLocate(params))
      .then(bladeObj => {
        logger.debug('locate protocol response?', bladeObj)
        return 'BU'
      })
      .catch(error => {
        logger.error('locate protocol response?', error)
        return null
      })
  }
}