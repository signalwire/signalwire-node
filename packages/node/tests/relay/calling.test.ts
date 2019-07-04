import { SwEvent } from '../../../common/src/util/constants'
import { isQueued, trigger } from '../../../common/src/services/Handler'
import Call from '../../../common/src/relay/calling/Call'
import Calling from '../../../common/src/relay/calling/Calling'
import RelayClient from '../../src/relay'
import DialResult from '../../../common/src/relay/calling/results/DialResult'

const Connection = require('../../../common/src/services/Connection')

describe('Calling', () => {
  let session: RelayClient = null

  const _common = () => {
    beforeAll(done => {
      session = new RelayClient({ host: 'example.signalwire.com', project: 'project', token: 'token' })
      session.connect().then(done)
    })

    afterAll(() => {
      session.disconnect()
      session = null
    })

    it('should setup its own protocol that persist on session', async done => {
      _mockConnection()
      expect(session.calling).toBeInstanceOf(Calling)

      const proto = await session.calling.Ready
      expect(proto).toEqual('signalwire_service_random_uuid')

      Connection.mockSend.mockClear()
      expect(session.calling.protocol).toEqual('signalwire_service_random_uuid')
      expect(Connection.mockSend).not.toHaveBeenCalled()

      done()
    })
  }

  const _mockConnection = () => {
    Connection.mockResponse
      .mockReturnValueOnce(JSON.parse('{"id":"c04d725a-c8bc-4b9e-bf1e-9c05150797cc","jsonrpc":"2.0","result":{"requester_nodeid":"05b1114c-XXXX-YYYY-ZZZZ-feaa30afad6c","responder_nodeid":"9811eb32-XXXX-YYYY-ZZZZ-ab56fa3b83c9","result":{"protocol":"signalwire_service_random_uuid"}}}'))
      .mockReturnValueOnce(JSON.parse('{"id":"24f9b545-8bed-49e1-8214-5dbadb545f7d","jsonrpc":"2.0","result":{"command":"add","failed_channels":[],"protocol":"signalwire_service_random_uuid","subscribe_channels":["notifications"]}}'))
  }

  describe('.newCall()', () => {
    _common.call(this)
    const callOpts = { type: 'phone', from: '8992222222', to: '8991111111' }

    it('should return a new Call object', async done => {
      const call = await session.calling.newCall(callOpts)
      expect(call).toBeInstanceOf(Call)
      done()
    })

    describe('calling.call.state notification', () => {
      const fnMock = jest.fn()
      const CALL_TAG = '1ed7b040-812a-44b2-8dde-9f8adf6773af'
      const CALL_ID = '0462e84a-2415-4599-bbf7-982d3c9bb310'

      const _commonExpect = (call, state) => {
        expect(fnMock).toHaveBeenCalledTimes(2) // 2 times: stateChange and current state
        expect(fnMock).toBeCalledWith(call)
        expect(call.state).toEqual(state)
      }

      afterEach(() => {
        session.calling.removeCall(session.calling.getCallByTag(CALL_TAG))
        session.calling.removeCall(session.calling.getCallById(CALL_ID))

        fnMock.mockClear()
      })

      it('should handle the "created" state setting up callId and nodeId', async done => {
        const call = await session.calling.newCall(callOpts)
        call.tag = CALL_TAG
        call.on('stateChange', fnMock)
        call.on('created', fnMock)
        const msg = JSON.parse('{"jsonrpc":"2.0","id":"fc2c53bb-0a58-495a-acae-8067d17c003b","method":"blade.broadcast","params":{"broadcaster_nodeid":"c8dc8b19-ef08-4569-XXXX-36978e36c9bd","protocol":"signalwire_service_random_uuid","channel":"notifications","event":"relay","params":{"event_type":"calling.call.state","event_channel":"signalwire_service_random_uuid","timestamp":1556036283.9593921,"project_id":"project","params":{"call_state":"created","direction":"outbound","device":{"type":"phone","params":{"from_number":"+12222222222","to_number":"+12222222223"}},"call_id":"0462e84a-2415-4599-bbf7-982d3c9bb310","node_id":"86e3fe27-955f-4bbf-XXXX-38d744578818","tag":"1ed7b040-812a-44b2-8dde-9f8adf6773af"}}}}')
        trigger(SwEvent.SocketMessage, msg, session.uuid)

        _commonExpect(call, 'created')
        expect(call.id).toEqual(CALL_ID)
        expect(call.nodeId).toEqual('86e3fe27-955f-4bbf-XXXX-38d744578818')
        done()
      })

      it('should handle the "ringing" state', async done => {
        const call = await session.calling.newCall(callOpts)
        call.id = CALL_ID
        call.on('stateChange', fnMock)
        call.on('ringing', fnMock)
        const msg = JSON.parse('{"jsonrpc":"2.0","id":"fc2c53bb-0a58-495a-acae-8067d17c003b","method":"blade.broadcast","params":{"broadcaster_nodeid":"c8dc8b19-ef08-4569-XXXX-36978e36c9bd","protocol":"signalwire_service_random_uuid","channel":"notifications","event":"relay","params":{"event_type":"calling.call.state","event_channel":"signalwire_service_random_uuid","timestamp":1556036283.9593921,"project_id":"project","params":{"call_state":"ringing","direction":"outbound","device":{"type":"phone","params":{"from_number":"+12222222222","to_number":"+12222222223"}},"call_id":"0462e84a-2415-4599-bbf7-982d3c9bb310","node_id":"86e3fe27-955f-4bbf-XXXX-38d744578818","tag":"1ed7b040-812a-44b2-8dde-9f8adf6773af"}}}}')
        trigger(SwEvent.SocketMessage, msg, session.uuid)

        _commonExpect(call, 'ringing')
        done()
      })

      it('should handle the "answered" state', async done => {
        const call = await session.calling.newCall(callOpts)
        call.id = CALL_ID
        call.on('stateChange', fnMock)
        call.on('answered', fnMock)
        const msg = JSON.parse('{"jsonrpc":"2.0","id":"fc2c53bb-0a58-495a-acae-8067d17c003b","method":"blade.broadcast","params":{"broadcaster_nodeid":"c8dc8b19-ef08-4569-XXXX-36978e36c9bd","protocol":"signalwire_service_random_uuid","channel":"notifications","event":"relay","params":{"event_type":"calling.call.state","event_channel":"signalwire_service_random_uuid","timestamp":1556036283.9593921,"project_id":"project","params":{"call_state":"answered","direction":"outbound","device":{"type":"phone","params":{"from_number":"+12222222222","to_number":"+12222222223"}},"call_id":"0462e84a-2415-4599-bbf7-982d3c9bb310","node_id":"86e3fe27-955f-4bbf-XXXX-38d744578818","tag":"1ed7b040-812a-44b2-8dde-9f8adf6773af"}}}}')
        trigger(SwEvent.SocketMessage, msg, session.uuid)

        _commonExpect(call, 'answered')
        done()
      })

      it('should handle the "ending" state', async done => {
        const call = await session.calling.newCall(callOpts)
        call.id = CALL_ID
        call.on('stateChange', fnMock)
        call.on('ending', fnMock)
        const msg = JSON.parse('{"jsonrpc":"2.0","id":"fc2c53bb-0a58-495a-acae-8067d17c003b","method":"blade.broadcast","params":{"broadcaster_nodeid":"c8dc8b19-ef08-4569-XXXX-36978e36c9bd","protocol":"signalwire_service_random_uuid","channel":"notifications","event":"relay","params":{"event_type":"calling.call.state","event_channel":"signalwire_service_random_uuid","timestamp":1556036283.9593921,"project_id":"project","params":{"call_state":"ending","direction":"outbound","device":{"type":"phone","params":{"from_number":"+12222222222","to_number":"+12222222223"}},"call_id":"0462e84a-2415-4599-bbf7-982d3c9bb310","node_id":"86e3fe27-955f-4bbf-XXXX-38d744578818","tag":"1ed7b040-812a-44b2-8dde-9f8adf6773af"}}}}')
        trigger(SwEvent.SocketMessage, msg, session.uuid)

        _commonExpect(call, 'ending')
        done()
      })

      it('should handle the "ended" state', async done => {
        const call = await session.calling.newCall(callOpts)
        call.id = CALL_ID
        call.on('stateChange', fnMock)
        call.on('ended', fnMock)
        const msg = JSON.parse('{"jsonrpc":"2.0","id":"fc2c53bb-0a58-495a-acae-8067d17c003b","method":"blade.broadcast","params":{"broadcaster_nodeid":"c8dc8b19-ef08-4569-XXXX-36978e36c9bd","protocol":"signalwire_service_random_uuid","channel":"notifications","event":"relay","params":{"event_type":"calling.call.state","event_channel":"signalwire_service_random_uuid","timestamp":1556036283.9593921,"project_id":"project","params":{"call_state":"ended","direction":"outbound","device":{"type":"phone","params":{"from_number":"+12222222222","to_number":"+12222222223"}},"call_id":"0462e84a-2415-4599-bbf7-982d3c9bb310","node_id":"86e3fe27-955f-4bbf-XXXX-38d744578818","tag":"1ed7b040-812a-44b2-8dde-9f8adf6773af"}}}}')
        trigger(SwEvent.SocketMessage, msg, session.uuid)

        _commonExpect(call, 'ended')
        done()
      })
    })
  })

  describe('.dial()', () => {
    _common.call(this)

    afterEach(() => {
      session.calling._calls = []
    })

    const callOpts = { type: 'phone', from: '8992222222', to: '8991111111' }
    const _stateNotificationCreated = JSON.parse(`{"event_type":"calling.call.state","params":{"call_state":"created","direction":"inbound","device":{"type":"phone","params":{"from_number":"+1234","to_number":"15678"}},"tag":"mocked-uuid","call_id":"call-id","node_id":"node-id"}}`)
    const _stateNotificationAnswered = JSON.parse(`{"event_type":"calling.call.state","params":{"call_state":"answered","direction":"inbound","device":{"type":"phone","params":{"from_number":"+1234","to_number":"15678"}},"tag":"mocked-uuid","call_id":"call-id","node_id":"node-id"}}`)
    const _stateNotificationEnded = JSON.parse(`{"event_type":"calling.call.state","params":{"call_state":"ended","end_reason":"busy","direction":"inbound","device":{"type":"phone","params":{"from_number":"+1234","to_number":"15678"}},"tag":"mocked-uuid","call_id":"call-id","node_id":"node-id"}}`)

    it('should create a Call object, dial and wait the call to be answered', done => {
      session.calling.dial(callOpts).then(result => {
        expect(result).toBeInstanceOf(DialResult)
        expect(result.call).toBeInstanceOf(Call)
        expect(result.successful).toBe(true)
        done()
      })
      // @ts-ignore
      setTimeout(() => session.calling.notificationHandler(_stateNotificationCreated))
      // @ts-ignore
      setTimeout(() => session.calling.notificationHandler(_stateNotificationAnswered))
    })

    it('should create a Call object, dial and wait the call to be ended', done => {
      session.calling.dial(callOpts).then(result => {
        expect(result).toBeInstanceOf(DialResult)
        expect(result.call).toBeInstanceOf(Call)
        expect(result.successful).toBe(false)
        done()
      })
      // @ts-ignore
      setTimeout(() => session.calling.notificationHandler(_stateNotificationCreated))
      // @ts-ignore
      setTimeout(() => session.calling.notificationHandler(_stateNotificationEnded))
    })
  })

  describe('.onInbound()', () => {
    _common.call(this)

    it('should register the inbound listener', async done => {
      Connection.mockSend.mockClear()
      await session.calling.onInbound('context', jest.fn())

      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      const { method } = Connection.mockSend.mock.calls[0][0].request.params
      expect(method).toEqual('call.receive')
      expect(isQueued(session.calling.protocol, `ctx:context`)).toEqual(true)

      done()
    })

    it('should handle the calling.call.receive notification', async done => {
      const fnMock = jest.fn()
      await session.calling.onInbound('context', fnMock)
      const msg = JSON.parse('{"id":"a16dae67-212b-4391-bb78-a0b9e45310b9","jsonrpc":"2.0","method":"blade.broadcast","params":{"broadcaster_nodeid":"9811eb32-1234-1234-1234-ab56fa3b83c9","channel":"notifications","event":"relay","params":{"event_channel":"signalwire_service_random_uuid","event_type":"calling.call.receive","params":{"call_id":"849982ab-1234-5678-1234-311534fa20d6","call_state":"created","context":"context","device":{"params":{"from_number":"+12222222222","to_number":"+12222222223"},"type":"phone"},"node_id":"9811eb32-1234-5678-XXXX-ab56fa3b83c9"},"project_id":"project","space_id":"space","timestamp":1149889452.302629},"protocol":"signalwire_service_random_uuid"}}')
      trigger(SwEvent.SocketMessage, msg, session.uuid)
      expect(fnMock).toHaveBeenCalledTimes(1)
      expect(fnMock).toBeCalledWith(expect.any(Call))
      done()
    })
  })
})
