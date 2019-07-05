import RelayClientNode from '../../node/src/relay'
import RelayClientWeb from '../../js/src/SignalWire'
import Setup from '../src/services/Setup'
const Connection = require('../../common/src/services/Connection')
jest.mock('../../common/src/services/Connection')

describe('Setup', () => {
  const swOptions = { host: 'example.signalwire.com', project: 'project', token: 'token' }

  beforeEach(() => {
    Connection.mockSend.mockClear()
    Connection.mockResponse
      .mockImplementationOnce(() => JSON.parse('{"id":"c04d725a-c8bc-4b9e-bf1e-9c05150797cc","jsonrpc":"2.0","result":{"requester_nodeid":"05b1114c-XXXX-YYYY-ZZZZ-feaa30afad6c","responder_nodeid":"9811eb32-XXXX-YYYY-ZZZZ-ab56fa3b83c9","result":{"protocol":"signalwire_service_random_uuid"}}}'))
      .mockImplementationOnce(() => JSON.parse('{"id":"24f9b545-8bed-49e1-8214-5dbadb545f7d","jsonrpc":"2.0","result":{"command":"add","failed_channels":[],"protocol":"signalwire_service_random_uuid","subscribe_channels":["notifications"]}}'))
  })

  const _common = async (session) => {
    session.connection = Connection.default()
    const protocol = await Setup(session)
    expect(protocol).toEqual('signalwire_service_random_uuid')
    expect(session.subscriptions).toHaveProperty(protocol)
    expect(Connection.mockSend).toHaveBeenCalledTimes(2)
  }

  it('RelayClientWeb should setup a new protocol', async done => {
    const session = new RelayClientWeb(swOptions)
    await _common(session)
    done()
  })

  it('RelayClientNode should setup a new protocol', async done => {
    const session = new RelayClientNode(swOptions)
    await _common(session)
    done()
  })
})
