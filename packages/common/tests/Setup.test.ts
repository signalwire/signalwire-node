import { isQueued } from '../../common/src/services/Handler'
import RelayClientNode from '../../node/src/relay'
import RelayClientWeb from '../../web/src/SignalWire'
import { Setup } from '../src/services/Setup'
const Connection = require('../../common/src/services/Connection')
jest.mock('../../common/src/services/Connection')

describe('Setup', () => {
  const fnMock = jest.fn()
  const service = 'service'
  const swOptions = { host: 'example.signalwire.com', project: 'project', token: 'token', domain: 'domain', resource: 'resource' }
  let session = null
  const _test = async done => {
    const protocol = await Setup(session, service, fnMock)
    expect(protocol).toEqual('signalwire_service_random_uuid')
    expect(session.subscriptions).toHaveProperty(protocol)
    expect(isQueued(protocol, 'notifications')).toEqual(true)
    expect(Connection.mockSend).toHaveBeenCalledTimes(2)
    done()
  }

  beforeEach(() => {
    Connection.mockSend.mockClear()
    Connection.mockResponse
      .mockImplementationOnce(() => JSON.parse('{"id":"c04d725a-c8bc-4b9e-bf1e-9c05150797cc","jsonrpc":"2.0","result":{"requester_nodeid":"05b1114c-XXXX-YYYY-ZZZZ-feaa30afad6c","responder_nodeid":"9811eb32-XXXX-YYYY-ZZZZ-ab56fa3b83c9","result":{"protocol":"signalwire_service_random_uuid"}}}'))
      .mockImplementationOnce(() => JSON.parse('{"id":"24f9b545-8bed-49e1-8214-5dbadb545f7d","jsonrpc":"2.0","result":{"command":"add","failed_channels":[],"protocol":"signalwire_service_random_uuid","subscribe_channels":["notifications"]}}'))
  })

  afterEach(() => {
    session.disconnect()
    session = null
  })

  describe('RelayClientWeb', () => {
    beforeAll(done => {
      session = new RelayClientWeb(swOptions)
      session.connect().then(done)
    })

    it('should setup a new protocol', _test)
  })

  describe('RelayClientNode', () => {
    beforeAll(done => {
      session = new RelayClientNode(swOptions)
      session.connect().then(done)
    })

    it('should setup a new protocol', _test)
  })
})
