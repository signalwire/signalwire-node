import { SwEvent } from '../../../common/src/util/constants'
import { isQueued, trigger } from '../../../common/src/services/Handler'
import SendResult from '../../../common/src/relay/messaging/SendResult'
import Message from '../../../common/src/relay/messaging/Message'
import RelayClient from '../../src/relay'

const Connection = require('../../../common/src/services/Connection')

describe('Messaging', () => {
  const session: RelayClient = new RelayClient({ project: 'project', token: 'token' })
  // @ts-ignore
  session.connection = Connection.default()
  session.relayProtocol = 'signalwire_service_random_uuid'

  describe('.send()', () => {

    const messageOpts = { context: 'office', from: '8992222222', to: '8991111111', body: 'Hello' }

    it('should return a SendResult with success 200 response code', async done => {
      Connection.mockResponse.mockReturnValueOnce(JSON.parse('{"id":"uuid","jsonrpc":"2.0","result":{"result":{"code":"200","message":"message","message_id":"message-uuid"}}}'))
      const result = await session.messaging.send(messageOpts)
      expect(result).toBeInstanceOf(SendResult)
      expect(result.successful).toBe(true)
      expect(result.messageId).toEqual('message-uuid')
      done()
    })

    it('should return a SendResult with failed 400 response code', async done => {
      Connection.mockResponse.mockReturnValueOnce(JSON.parse('{"id":"uuid","jsonrpc":"2.0","result":{"result":{"code":"400","message":"some error"}}}'))
      const result = await session.messaging.send(messageOpts)
      expect(result).toBeInstanceOf(SendResult)
      expect(result.successful).toBe(false)
      expect(result.messageId).toBeUndefined()
      done()
    })
  })

  describe('.onReceive()', () => {

    it('should register the inbound listener', async done => {
      Connection.mockSend.mockClear()
      await session.messaging.onReceive(['home'], jest.fn())
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      const { method } = Connection.mockSend.mock.calls[0][0].request.params
      expect(method).toEqual('signalwire.receive')
      expect(isQueued(session.relayProtocol, 'messaging.ctxReceive.home')).toEqual(true)
      done()
    })

    it('should handle the messaging.receive notification', async done => {
      const fnMock = jest.fn()
      await session.messaging.onReceive(['home'], fnMock)
      const msg = JSON.parse('{"jsonrpc":"2.0","id":"req-uuid","method":"blade.broadcast","params":{"broadcaster_nodeid":"uuid","protocol":"signalwire_service_random_uuid","channel":"notifications","event":"queuing.relay.messaging","params":{"event_type":"messaging.receive","space_id":"uuid","project_id":"uuid","context":"home","params":{"message_id":"id","context":"home","direction":"inbound","tags":["message","inbound","SMS","home","+1xxx","+1yyy","relay-client"],"from_number":"+1xxx","to_number":"+1yyy","body":"Welcome at SignalWire!","media":[],"segments":1,"message_state":"received"}}}}')
      trigger(SwEvent.SocketMessage, msg, session.uuid)
      expect(fnMock).toHaveBeenCalledTimes(1)
      expect(fnMock).toBeCalledWith(expect.any(Message))
      done()
    })
  })

  describe('.onStateChange()', () => {

    it('should register the state change listener', async done => {
      Connection.mockSend.mockClear()
      await session.messaging.onStateChange(['other'], jest.fn())
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      const { method } = Connection.mockSend.mock.calls[0][0].request.params
      expect(method).toEqual('signalwire.receive')
      expect(isQueued(session.relayProtocol, 'messaging.ctxState.other')).toEqual(true)
      done()
    })

    it('should handle the messaging.state notification', async done => {
      const fnMock = jest.fn()
      await session.messaging.onStateChange(['other'], fnMock)
      const msg = JSON.parse('{"jsonrpc":"2.0","id":"req-id","method":"blade.broadcast","params":{"broadcaster_nodeid":"uuid","protocol":"signalwire_service_random_uuid","channel":"notifications","event":"queuing.relay.messaging","params":{"event_type":"messaging.state","space_id":"uuid","project_id":"uuid","context":"other","params":{"message_id":"224d1192-b266-4ca2-bd8e-48c64a44d830","context":"other","direction":"outbound","tags":["message","outbound","SMS","office","relay-client"],"from_number":"+1xxx","to_number":"+1yyy","body":"Welcome at SignalWire!","media":[],"segments":1,"message_state":"queued"}}}}')
      trigger(SwEvent.SocketMessage, msg, session.uuid)
      expect(fnMock).toHaveBeenCalledTimes(1)
      expect(fnMock).toBeCalledWith(expect.any(Message))
      done()
    })
  })
})
