import { SwEvent } from '../../../common/src/util/constants'
import { isQueued, trigger } from '../../../common/src/services/Handler'
import Call from '../../../common/src/relay/calling/Call'
import RelayClient from '../../src/relay'
import { DialResult } from '../../../common/src/relay/calling/results'
import { IMakeCallParams } from '../../../common/src/util/interfaces'

const Connection = require('../../../common/src/services/Connection')

describe('Calling', () => {
  const session: RelayClient = new RelayClient({ project: 'project', token: 'token' })
  // @ts-ignore
  session.connection = Connection.default()
  session.relayProtocol = 'signalwire_service_random_uuid'

  afterEach(() => {
    // @ts-ignore
    session.calling._calls = []
  })

  describe('.newCall()', () => {
    it('should throw an error with an unknown type', () => {
      expect(() => {
        session.calling.newCall({ type: 'wrong', from: '+18992222222', to: '+18991111111' })
      }).toThrow('Unknown type to create a new Call: wrong')
    })

    describe('with type phone', () => {
      const callOpts: IMakeCallParams = { type: 'phone', from: '+18992222222', to: '+18991111111' }

      it('should return a new Call object', () => {
        const call = session.calling.newCall(callOpts)
        expect(call).toBeInstanceOf(Call)
        expect(call.type).toEqual('phone')
      })
    })

    describe('with type agora', () => {
      const callOpts: IMakeCallParams = { type: 'agora', from: '+18992222222', to: '+18991111111', agoraAppId: 'agora-app-id', agoraChannel: 'agora-channel' }

      it('should return a new Call object', () => {
        const call = session.calling.newCall(callOpts)
        expect(call).toBeInstanceOf(Call)
        expect(call.type).toEqual('agora')
      })
    })
  })

  describe('.dial()', () => {

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
      session.calling.notificationHandler(_stateNotificationCreated)
      session.calling.notificationHandler(_stateNotificationAnswered)
    })

    it('should create a Call object, dial and wait the call to be ended', done => {
      session.calling.dial(callOpts).then(result => {
        expect(result).toBeInstanceOf(DialResult)
        expect(result.call).toBeInstanceOf(Call)
        expect(result.successful).toBe(false)
        done()
      })
      session.calling.notificationHandler(_stateNotificationCreated)
      session.calling.notificationHandler(_stateNotificationEnded)
    })
  })

  describe('.onReceive()', () => {

    it('should register the inbound listener', async done => {
      Connection.mockSend.mockClear()
      await session.calling.onReceive(['context'], jest.fn())

      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      const { method } = Connection.mockSend.mock.calls[0][0].request.params
      expect(method).toEqual('signalwire.receive')
      expect(isQueued(session.relayProtocol, 'calling.ctxReceive.context')).toEqual(true)

      done()
    })

    it('should handle the calling.call.receive notification', async done => {
      const fnMock = jest.fn()
      await session.calling.onReceive(['context'], fnMock)
      const msg = JSON.parse('{"id":"a16dae67-212b-4391-bb78-a0b9e45310b9","jsonrpc":"2.0","method":"blade.broadcast","params":{"broadcaster_nodeid":"9811eb32-1234-1234-1234-ab56fa3b83c9","channel":"notifications","event":"queuing.relay.events","params":{"event_channel":"signalwire_service_random_uuid","event_type":"calling.call.receive","params":{"call_id":"849982ab-1234-5678-1234-311534fa20d6","call_state":"created","context":"context","device":{"params":{"from_number":"+12222222222","to_number":"+12222222223"},"type":"phone"},"node_id":"9811eb32-1234-5678-XXXX-ab56fa3b83c9"},"project_id":"project","space_id":"space","timestamp":1149889452.302629},"protocol":"signalwire_service_random_uuid"}}')
      trigger(SwEvent.SocketMessage, msg, session.uuid)
      expect(fnMock).toHaveBeenCalledTimes(1)
      expect(fnMock).toBeCalledWith(expect.any(Call))
      done()
    })
  })

  describe('on inbound calling.call.state notification', () => {
    const CALL_ID = '0462e84a-2415-4599-bbf7-982d3c9bb310'
    const fnMock = jest.fn()
    let call = null
    beforeEach(() => {
      fnMock.mockClear()
      call = session.calling.newCall({ type: 'phone', from: '+18992222222', to: '+18991111111' })
      call.tag = '1ed7b040-812a-44b2-8dde-9f8adf6773af'
      call.on('stateChange', fnMock)
    })

    const _commonExpect = (call: Call, state: string) => {
      expect(fnMock).toHaveBeenCalledTimes(2) // 2 times: stateChange and current state
      expect(fnMock).toBeCalledWith(call)
      expect(call.state).toEqual(state)
    }

    it('should handle the "created" state setting up callId and nodeId', done => {
      call.on('created', fnMock)
      const msg = JSON.parse('{"jsonrpc":"2.0","id":"uuid","method":"blade.broadcast","params":{"protocol":"signalwire_service_random_uuid","channel":"notifications","event":"queuing.relay.events","params":{"event_type":"calling.call.state","event_channel":"signalwire_service_random_uuid","timestamp":1556036283.9593921,"params":{"call_state":"created","direction":"outbound","device":{"type":"phone","params":{"from_number":"+12222222222","to_number":"+12222222223"}},"call_id":"0462e84a-2415-4599-bbf7-982d3c9bb310","node_id":"86e3fe27-955f-4bbf-XXXX-38d744578818","tag":"1ed7b040-812a-44b2-8dde-9f8adf6773af"}}}}')
      trigger(SwEvent.SocketMessage, msg, session.uuid)

      _commonExpect(call, 'created')
      expect(call.id).toEqual(CALL_ID)
      expect(call.nodeId).toEqual('86e3fe27-955f-4bbf-XXXX-38d744578818')
      done()
    })

    it('should handle the "ringing" state', done => {
      call.id = CALL_ID
      call.on('ringing', fnMock)
      const msg = JSON.parse('{"jsonrpc":"2.0","id":"uuid","method":"blade.broadcast","params":{"protocol":"signalwire_service_random_uuid","channel":"notifications","event":"queuing.relay.events","params":{"event_type":"calling.call.state","event_channel":"signalwire_service_random_uuid","timestamp":1556036283.9593921,"params":{"call_state":"ringing","direction":"outbound","device":{"type":"phone","params":{"from_number":"+12222222222","to_number":"+12222222223"}},"call_id":"0462e84a-2415-4599-bbf7-982d3c9bb310","node_id":"86e3fe27-955f-4bbf-XXXX-38d744578818","tag":"1ed7b040-812a-44b2-8dde-9f8adf6773af"}}}}')
      trigger(SwEvent.SocketMessage, msg, session.uuid)

      _commonExpect(call, 'ringing')
      done()
    })

    it('should handle the "answered" state', done => {
      call.id = CALL_ID
      call.on('answered', fnMock)
      const msg = JSON.parse('{"jsonrpc":"2.0","id":"uuid","method":"blade.broadcast","params":{"protocol":"signalwire_service_random_uuid","channel":"notifications","event":"queuing.relay.events","params":{"event_type":"calling.call.state","event_channel":"signalwire_service_random_uuid","timestamp":1556036283.9593921,"params":{"call_state":"answered","direction":"outbound","device":{"type":"phone","params":{"from_number":"+12222222222","to_number":"+12222222223"}},"call_id":"0462e84a-2415-4599-bbf7-982d3c9bb310","node_id":"86e3fe27-955f-4bbf-XXXX-38d744578818","tag":"1ed7b040-812a-44b2-8dde-9f8adf6773af"}}}}')
      trigger(SwEvent.SocketMessage, msg, session.uuid)

      _commonExpect(call, 'answered')
      done()
    })

    it('should handle the "ending" state', done => {
      call.id = CALL_ID
      call.on('ending', fnMock)
      const msg = JSON.parse('{"jsonrpc":"2.0","id":"uuid","method":"blade.broadcast","params":{"protocol":"signalwire_service_random_uuid","channel":"notifications","event":"queuing.relay.events","params":{"event_type":"calling.call.state","event_channel":"signalwire_service_random_uuid","timestamp":1556036283.9593921,"params":{"call_state":"ending","direction":"outbound","device":{"type":"phone","params":{"from_number":"+12222222222","to_number":"+12222222223"}},"call_id":"0462e84a-2415-4599-bbf7-982d3c9bb310","node_id":"86e3fe27-955f-4bbf-XXXX-38d744578818","tag":"1ed7b040-812a-44b2-8dde-9f8adf6773af"}}}}')
      trigger(SwEvent.SocketMessage, msg, session.uuid)

      _commonExpect(call, 'ending')
      done()
    })

    it('should handle the "ended" state', done => {
      call.id = CALL_ID
      call.on('ended', fnMock)
      const msg = JSON.parse('{"jsonrpc":"2.0","id":"uuid","method":"blade.broadcast","params":{"protocol":"signalwire_service_random_uuid","channel":"notifications","event":"queuing.relay.events","params":{"event_type":"calling.call.state","event_channel":"signalwire_service_random_uuid","timestamp":1556036283.9593921,"params":{"call_state":"ended","direction":"outbound","device":{"type":"phone","params":{"from_number":"+12222222222","to_number":"+12222222223"}},"call_id":"0462e84a-2415-4599-bbf7-982d3c9bb310","node_id":"86e3fe27-955f-4bbf-XXXX-38d744578818","tag":"1ed7b040-812a-44b2-8dde-9f8adf6773af"}}}}')
      trigger(SwEvent.SocketMessage, msg, session.uuid)

      _commonExpect(call, 'ended')
      done()
    })
  })
})
