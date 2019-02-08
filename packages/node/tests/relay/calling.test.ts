import { monitorCallbackQueue } from '../../../common/src/services/Handler'
import Call from '../../src/relay/calling/Call'
import Calling from '../../src/relay/calling/Calling'
import SignalWire from '../../src/SignalWire'
const Connection = require('../../../common/src/services/Connection')
jest.mock('../../../common/src/services/Connection')

describe('Setup', () => {
  let session = null
  let check: boolean = false

  const _common = (fnToBeTested: any) => {
    beforeAll(async done => {
      check = false
      session = new SignalWire({ host: 'example.signalwire.com', project: 'project', token: 'token' })
      await session.connect()

      expect(session.calling).toBeInstanceOf(Calling)
      expect(session.calling).not.toBe(new Calling(session))

      done()
    })

    afterAll(() => {
      session.disconnect()
      session = null
    })

    beforeEach(() => {
      Connection.mockResponse
        .mockImplementationOnce(() => JSON.parse('{"id":"c04d725a-c8bc-4b9e-bf1e-9c05150797cc","jsonrpc":"2.0","result":{"requester_nodeid":"05b1114c-XXXX-YYYY-ZZZZ-feaa30afad6c","responder_nodeid":"9811eb32-XXXX-YYYY-ZZZZ-ab56fa3b83c9","result":{"protocol":"signalwire_service_random_uuid"}}}'))
        .mockImplementationOnce(() => JSON.parse('{"id":"24f9b545-8bed-49e1-8214-5dbadb545f7d","jsonrpc":"2.0","result":{"command":"add","failed_channels":[],"protocol":"signalwire_service_random_uuid","subscribe_channels":["notifications"]}}'))
    })

    it('should setup its own protocol', async done => {
      await fnToBeTested()
      expect(session.calling.protocol).toEqual('signalwire_service_random_uuid')
      done()
    })

    it('should reuse the protocol setupped previously', async done => {
      Connection.mockSend.mockClear()
      check = true
      await fnToBeTested()
      expect(session.calling.protocol).toEqual('signalwire_service_random_uuid')

      done()
    })
  }

  describe('.makeCall()', () => {
    const fn = async () => {
      await session.calling.makeCall('2234', '5678')
      if (check) {
        expect(Connection.mockSend).not.toHaveBeenCalled()
      }
    }
    _common.bind(this)(fn)

    it('should return a new Call object', async done => {
      const call = await session.calling.makeCall('2234', '5678')
      expect(call).toBeInstanceOf(Call)
      done()
    })
  })

  describe('.onInbound()', () => {
    const fnMock = jest.fn()
    const fn = async () => {
      await session.calling.onInbound('test', fnMock)
      if (check) {
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      }
    }
    _common.bind(this)(fn)

    it('should register the inbound listener', async done => {
      await session.calling.onInbound('test', fnMock)
      const { protocol } = session.calling
      expect(monitorCallbackQueue()).toHaveProperty(protocol)
      expect(monitorCallbackQueue()[protocol]).toHaveProperty('inbound')
      done()
    })

    it('should handle the notification', async done => {
      await session.calling.onInbound('test', fnMock)
      const { protocol } = session.calling
      expect(monitorCallbackQueue()).toHaveProperty(protocol)
      expect(monitorCallbackQueue()[protocol]).toHaveProperty('inbound')
      done()
    })
  })
})
