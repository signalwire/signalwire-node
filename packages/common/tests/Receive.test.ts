import RelayClientNode from '../../node/src/relay'
import Receive from '../src/services/Receive'
const Connection = require('../../common/src/services/Connection')
jest.mock('../../common/src/services/Connection')

describe('Receive', () => {
  const swOptions = { project: 'project', token: 'token' }

  const _common = async (session) => {
    beforeEach(() => {
      session.contexts = []
      Connection.mockSend.mockClear()
      Connection.mockResponse
        .mockReset()
        .mockImplementationOnce(() => JSON.parse('{"id":"c04d725a-c8bc-4b9e-bf1e-9c05150797cc","jsonrpc":"2.0","result":{"requester_nodeid":"uuid","responder_nodeid":"uuid","result":{"code":"200","message":"Receiving all inbound related to the requested relay contexts"}}}'))
    })

    session.connection = Connection.default()

    it('should register a context using a string', async done => {
      const success = await Receive(session, 'test')
      expect(success).toEqual(true)
      expect(session.contexts).toEqual(['test'])
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      done()
    })

    it('should register a context using an array', async done => {
      const success = await Receive(session, ['test', 'test1'])
      expect(success).toEqual(true)
      expect(session.contexts).toEqual(['test', 'test1'])
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      done()
    })

    it('should fail using invalid contexts', async done => {
      const success = await Receive(session, '')
      expect(success).toEqual(false)
      expect(session.contexts).toEqual([])
      expect(Connection.mockSend).toHaveBeenCalledTimes(0)
      // @ts-ignore
      const success2 = await Receive(session, [null, false, '', NaN])
      expect(success2).toEqual(false)
      expect(session.contexts).toEqual([])
      expect(Connection.mockSend).toHaveBeenCalledTimes(0)
      done()
    })

    it('should concat the contexts already registered', async done => {
      session.contexts = ['exists']
      const success = await Receive(session, ['home', 'office', 'exists'])
      expect(success).toEqual(true)
      expect(session.contexts).toEqual(['exists', 'home', 'office'])
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      done()
    })
  }

  describe('on a node client with success response', () => {
    const session = new RelayClientNode(swOptions)
    _common(session)
  })

  describe('on a node client with failure response', () => {
    const session = new RelayClientNode(swOptions)
    // @ts-ignore
    session.connection = Connection.default()

    beforeEach(() => {
      session.contexts = []
      Connection.mockSend.mockClear()
      Connection.mockResponse
        .mockReset()
        .mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"req-uuid","error":{"requester_nodeid":"uuid","responder_nodeid":"uuid","code":-32601,"message":"Error message.."}}'))
    })

    it('should return false', async done => {
      const success = await Receive(session, 'test')
      expect(success).toEqual(false)
      expect(session.contexts).toHaveLength(0)
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      done()
    })
  })
})
