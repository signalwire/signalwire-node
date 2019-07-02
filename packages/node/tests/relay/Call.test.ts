import RelayClient from '../../src/relay'
import { ICallDevice } from '../../../common/src/util/interfaces'
import Call from '../../../common/src/relay/calling/Call'
import { CallNotification, CallState } from '../../../common/src/util/constants/relay'
import { isQueued } from '../../../common/src/services/Handler'
import { Execute } from '../../../common/src/messages/Blade'
const Connection = require('../../../common/src/services/Connection')
import Dial from '../../../common/src/relay/calling/components/Dial'
import Hangup from '../../../common/src/relay/calling/components/Hangup'
import HangupResult from '../../../common/src/relay/calling/results/HangupResult'
import Record from '../../../common/src/relay/calling/components/Record'
import RecordResult from '../../../common/src/relay/calling/results/RecordResult'
import RecordAction from '../../../common/src/relay/calling/actions/RecordAction'
import Answer from '../../../common/src/relay/calling/components/Answer'
import AnswerResult from '../../../common/src/relay/calling/results/AnswerResult'
import Play from '../../../common/src/relay/calling/components/Play'
import PlayResult from '../../../common/src/relay/calling/results/PlayResult'
import PlayAction from '../../../common/src/relay/calling/actions/PlayAction'
import Prompt from '../../../common/src/relay/calling/components/Prompt'
import PromptResult from '../../../common/src/relay/calling/results/PromptResult'
import PromptAction from '../../../common/src/relay/calling/actions/PromptAction'
import Connect from '../../../common/src/relay/calling/components/Connect'
import ConnectResult from '../../../common/src/relay/calling/results/ConnectResult'
import ConnectAction from '../../../common/src/relay/calling/actions/ConnectAction'
jest.mock('../../../common/src/services/Connection')

describe('Call', () => {
  const device: ICallDevice = { type: 'phone', params: { from_number: '2345', to_number: '6789', timeout: 30 } }
  let session: RelayClient = null
  let call: Call = null

  beforeAll(async done => {
    session = new RelayClient({ host: 'example.signalwire.com', project: 'project', token: 'token' })
    await session.connect()

    Connection.mockResponse
      .mockReturnValueOnce(JSON.parse('{"id":"c04d725a-c8bc-4b9e-bf1e-9c05150797cc","jsonrpc":"2.0","result":{"requester_nodeid":"05b1114c-XXXX-YYYY-ZZZZ-feaa30afad6c","responder_nodeid":"9811eb32-XXXX-YYYY-ZZZZ-ab56fa3b83c9","result":{"protocol":"signalwire_service_random_uuid"}}}'))
      .mockReturnValueOnce(JSON.parse('{"id":"24f9b545-8bed-49e1-8214-5dbadb545f7d","jsonrpc":"2.0","result":{"command":"add","failed_channels":[],"protocol":"signalwire_service_random_uuid","subscribe_channels":["notifications"]}}'))
    done()
  })

  beforeEach(() => {
    Connection.mockSend.mockClear()
    session.calling._calls = []
    // @ts-ignore
    call = new Call(session.calling, { device })
  })

  it('should create the Call object with no id and nodeId', () => {
    expect(call.state).toEqual('none')
    expect(call.id).toBeUndefined()
    expect(call.nodeId).toBeUndefined()
  })

  it('should add the call to the cache array', () => {
    expect(session.calling._calls).toContain(call)
  })

  it('should not have peers', () => {
    expect(call.peer).toBeUndefined()
  })

  describe('.on()', () => {
    it('should be chainable', () => {
      expect(call.on('created', jest.fn())).toBe(call)
    })

    it('should save callback in the stack', () => {
      const mockFn = jest.fn()
      call.on('created', mockFn)
      call.on('answered', mockFn)
      call._stateChange({ call_state: 'created' })
      call._stateChange({ call_state: 'answered' })
      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('.off()', () => {
    it('should be chainable', () => {
      expect(call.off('created', jest.fn())).toBe(call)
    })

    it('should remove callback from the stack', () => {
      const mockFn = jest.fn()
      call.on('created', mockFn)
      call.off('created', mockFn)
      call._stateChange({ call_state: 'created' })
      expect(mockFn).not.toHaveBeenCalled()
    })
  })

  describe('when call is ready', () => {
    const _stateNotificationAnswered = JSON.parse(`{"event_type":"calling.call.state","event_channel":"signalwire_service_random_uuid","project_id":"pid","space_id":"sid","params":{"call_state":"answered","direction":"inbound","device":{"type":"phone","params":{"from_number":"+1234","to_number":"15678"}},"call_id":"call-id","node_id":"node-id"}}`)
    const _stateNotificationEnded = JSON.parse(`{"event_type":"calling.call.state","event_channel":"signalwire_service_random_uuid","project_id":"pid","space_id":"sid","params":{"call_state":"ended","end_reason":"busy","direction":"inbound","device":{"type":"phone","params":{"from_number":"+1234","to_number":"15678"}},"call_id":"call-id","node_id":"node-id"}}`)

    // const _playNotification = JSON.parse(`{"state":"finished","call_id":"call-id","control_id":"mocked-uuid","event_type":"${CallNotification.Play}"}`)
    // const _promptNotification = JSON.parse(`{"control_id":"mocked-uuid","call_id":"call-id","event_type":"${CallNotification.Collect}","result":{"type":"digit","params":{"digits":"12345","terminator":"#"}}}`)
    // const _recordNotification = JSON.parse(`{"state":"finished","call_id":"call-id","control_id":"mocked-uuid","event_type":"${CallNotification.Record}","url":"record-url","record":{"audio":{"type":"digit","params":{"digits":"12345","terminator":"#"}}}}`)
    // const _connectNotification = JSON.parse(`{"connect_state":"connected","call_id":"call-id","control_id":"mocked-uuid","event_type":"${CallNotification.Connect}"}`)

    beforeEach(() => {
      call.id = 'call-id'
      call.nodeId = 'node-id'
      call.state = CallState.Created
      Connection.mockResponse.mockReturnValueOnce(JSON.parse('{"id":"c04d725a-c8bc-4b9e-bf1e-9c05150797cc","jsonrpc":"2.0","result":{"result":{"code":"200","message":"message","control_id":"control-id"}}}'))
    })

    // it('.answered should return true if the call has been answered', () => {
    //   call.state = 'ringing'
    //   expect(call.answered).toBe(false)

    //   call.state = 'answered'
    //   expect(call.answered).toBe(true)
    // })

    // it('.active should return true if the state is not in ending or ended', () => {
    //   call.state = 'answered'
    //   expect(call.active).toBe(true)
    //   call.state = 'ending'
    //   expect(call.active).toBe(false)
    //   call.state = 'ended'
    //   expect(call.active).toBe(false)
    // })

    // it('.ended should return true if the state is in ending or ended', () => {
    //   call.state = 'answered'
    //   expect(call.ended).toBe(false)
    //   call.state = 'ending'
    //   expect(call.ended).toBe(true)
    //   call.state = 'ended'
    //   expect(call.ended).toBe(true)
    // })

    it('.dial() should wait for "answered" event', done => {
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.begin',
        params: {
          tag: 'mocked-uuid',
          device: call.device
        }
      })
      call.dial().then(result => {
        // expect(result).toBeInstanceOf(DialResult)
        // expect(result.successful).toBe(true)
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })
      // @ts-ignore
      session.calling.notificationHandler(_stateNotificationAnswered)
    })

    it('.answer() should wait for "answered" event', done => {
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.answer',
        params: {
          node_id: call.nodeId,
          call_id: call.id
        }
      })
      call.answer().then(result => {
        expect(result).toBeInstanceOf(AnswerResult)
        expect(result.successful).toBe(true)
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })
      // @ts-ignore
      session.calling.notificationHandler(_stateNotificationAnswered)
    })

    it('.hangup() should wait for "ended" event', done => {
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.end',
        params: {
          node_id: call.nodeId,
          call_id: call.id,
          reason: 'busy'
        }
      })
      call.hangup('busy').then(result => {
        expect(result).toBeInstanceOf(HangupResult)
        expect(result.successful).toBe(true)
        expect(result.reason).toEqual('busy')
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })
      // @ts-ignore
      session.calling.notificationHandler(_stateNotificationEnded)
    })
  })
})
