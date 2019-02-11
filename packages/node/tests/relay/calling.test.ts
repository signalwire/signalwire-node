import { SwEvent } from '../../../common/src/util/constants'
import { monitorCallbackQueue, trigger } from '../../../common/src/services/Handler'
import Call from '../../src/relay/calling/Call'
import Calling from '../../src/relay/calling/Calling'
import SignalWire from '../../src/SignalWire'
const Connection = require('../../../common/src/services/Connection')
jest.mock('../../../common/src/services/Connection')

describe('Calling', () => {
  const mockSetupResponses = () => {
    Connection.mockResponse
      .mockImplementationOnce(() => JSON.parse('{"id":"c04d725a-c8bc-4b9e-bf1e-9c05150797cc","jsonrpc":"2.0","result":{"requester_nodeid":"05b1114c-XXXX-YYYY-ZZZZ-feaa30afad6c","responder_nodeid":"9811eb32-XXXX-YYYY-ZZZZ-ab56fa3b83c9","result":{"protocol":"signalwire_service_random_uuid"}}}'))
      .mockImplementationOnce(() => JSON.parse('{"id":"24f9b545-8bed-49e1-8214-5dbadb545f7d","jsonrpc":"2.0","result":{"command":"add","failed_channels":[],"protocol":"signalwire_service_random_uuid","subscribe_channels":["notifications"]}}'))
  }

  it('each client should have its own calling instance', () => {
    const session = new SignalWire({ host: 'example.signalwire.com', project: 'project', token: 'token' })
    expect(session.calling).toBeInstanceOf(Calling)
    expect(session.calling).not.toBe(new Calling(session))
    session.disconnect()
  })

  describe('.makeCall()', () => {
    let session: SignalWire = null

    beforeAll(async done => {
      session = new SignalWire({ host: 'example.signalwire.com', project: 'project', token: 'token' })
      await session.connect()
      done()
    })

    afterAll(() => {
      session.disconnect()
      session = null
    })

    it('should setup its own protocol', async done => {
      mockSetupResponses()
      await session.calling.makeCall('2234', '5678')
      expect(session.calling.protocol).toEqual('signalwire_service_random_uuid')
      done()
    })

    it('should reuse the protocol setupped previously', async done => {
      mockSetupResponses()
      Connection.mockSend.mockClear()
      await session.calling.makeCall('2234', '5678')
      expect(Connection.mockSend).not.toHaveBeenCalled()
      expect(session.calling.protocol).toEqual('signalwire_service_random_uuid')

      done()
    })

    it('should return a new Call object', async done => {
      const call = await session.calling.makeCall('2234', '5678')
      expect(call).toBeInstanceOf(Call)
      done()
    })
  })

  describe('.onInbound()', () => {
    let session: SignalWire = null
    const fnMock = jest.fn()
    const context = 'context'

    beforeAll(async done => {
      session = new SignalWire({ host: 'example.signalwire.com', project: 'project', token: 'token' })
      await session.connect()
      done()
    })

    afterAll(() => {
      session.disconnect()
      session = null
    })

    it('should setup its own protocol', async done => {
      mockSetupResponses()
      await session.calling.onInbound(context, fnMock)
      expect(session.calling.protocol).toEqual('signalwire_service_random_uuid')
      done()
    })

    it('should reuse the protocol setupped previously', async done => {
      mockSetupResponses()
      Connection.mockSend.mockClear()
      await session.calling.onInbound(context, fnMock)
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      expect(session.calling.protocol).toEqual('signalwire_service_random_uuid')

      done()
    })

    it('should register the inbound listener', async done => {
      await session.calling.onInbound(context, fnMock)
      const { protocol } = session.calling
      expect(monitorCallbackQueue()).toHaveProperty(protocol)
      expect(monitorCallbackQueue()[protocol]).toHaveProperty(`ctx:${context}`)
      done()
    })

    it('should handle the notification', async done => {
      const listener = jest.fn()
      await session.calling.onInbound(context, listener)
      const msg = JSON.parse('{"id":"a16dae67-212b-4391-bb78-a0b9e45310b9","jsonrpc":"2.0","method":"blade.broadcast","params":{"broadcaster_nodeid":"9811eb32-1234-1234-1234-ab56fa3b83c9","channel":"notifications","event":"relay","params":{"event_channel":"signalwire_service_random_uuid","event_type":"calling.call.receive","params":{"call_id":"849982ab-1234-5678-1234-311534fa20d6","call_state":"created","context":"context","device":{"params":{"from_number":"+12222222222","to_number":"+12222222223"},"type":"phone"},"node_id":"9811eb32-1234-5678-XXXX-ab56fa3b83c9"},"project_id":"project","space_id":"space","timestamp":1149889452.302629},"protocol":"signalwire_service_random_uuid"}}')
      trigger(SwEvent.SocketMessage, msg, session.uuid)
      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toBeCalledWith(expect.any(Call))
      done()
    })
  })
})
