import RelayClient from '../../src/relay'
import { ICallDevice, ICallingPlay } from '../../../common/src/util/interfaces'
import Call from '../../../common/src/relay/calling/Call'
import { CallNotification, CallState } from '../../../common/src/util/constants/relay'
import { Execute } from '../../../common/src/messages/Blade'
const Connection = require('../../../common/src/services/Connection')
import HangupResult from '../../../common/src/relay/calling/results/HangupResult'
import RecordResult from '../../../common/src/relay/calling/results/RecordResult'
import RecordAction from '../../../common/src/relay/calling/actions/RecordAction'
import AnswerResult from '../../../common/src/relay/calling/results/AnswerResult'
import PlayResult from '../../../common/src/relay/calling/results/PlayResult'
import PlayAction from '../../../common/src/relay/calling/actions/PlayAction'
import PromptResult from '../../../common/src/relay/calling/results/PromptResult'
import PromptAction from '../../../common/src/relay/calling/actions/PromptAction'
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
    const _stateNotificationAnswered = JSON.parse(`{"event_type":"calling.call.state","params":{"call_state":"answered","direction":"inbound","device":{"type":"phone","params":{"from_number":"+1234","to_number":"15678"}},"call_id":"call-id","node_id":"node-id"}}`)
    const _stateNotificationEnded = JSON.parse(`{"event_type":"calling.call.state","params":{"call_state":"ended","end_reason":"busy","direction":"inbound","device":{"type":"phone","params":{"from_number":"+1234","to_number":"15678"}},"call_id":"call-id","node_id":"node-id"}}`)
    const _recordNotification = JSON.parse(`{"event_type":"calling.call.record","params":{"state":"no_input","record":{"audio":{"format":"mp3","direction":"speak","stereo":false}},"url":"record.mp3","control_id":"mocked-uuid","size":4096,"duration":4,"call_id":"call-id","node_id":"node-id"}}`)
    const _connectNotification = JSON.parse(`{"event_type":"calling.call.connect","params":{"connect_state":"connected","device":{"node_id":"other-node-id","call_id":"other-call-id","tag":"other-tag-id","peer":{"type":"phone","params":{"from_number":"+1555","to_number":"+1777"}}},"tag":"mocked-uuid","call_id":"call-id","node_id":"node-id"}}`)
    const _playNotification = JSON.parse(`{"event_type":"calling.call.play","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","state":"finished"}}`)
    const _collectNotification = JSON.parse(`{"event_type":"calling.call.collect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","result":{"type":"digit","params":{"digits":"12345","terminator":"#"}}}}`)

    beforeEach(() => {
      call.id = 'call-id'
      call.nodeId = 'node-id'
      call.state = CallState.Created
      // Connection.mockResponse.mockReturnValueOnce(JSON.parse('{"id":"c04d725a-c8bc-4b9e-bf1e-9c05150797cc","jsonrpc":"2.0","result":{"result":{"code":"200","message":"message","control_id":"control-id"}}}'))
    })

    it('.answered should return true if the call has been answered', () => {
      call.state = 'ringing'
      expect(call.answered).toBe(false)

      call.state = 'answered'
      expect(call.answered).toBe(true)
    })

    it('.active should return true if the state is not in ending or ended', () => {
      call.state = 'answered'
      expect(call.active).toBe(true)
      call.state = 'ending'
      expect(call.active).toBe(false)
      call.state = 'ended'
      expect(call.active).toBe(false)
    })

    it('.ended should return true if the state is in ending or ended', () => {
      call.state = 'answered'
      expect(call.ended).toBe(false)
      call.state = 'ending'
      expect(call.ended).toBe(true)
      call.state = 'ended'
      expect(call.ended).toBe(true)
    })

    it('.dial() should wait for "answered" event', done => {
      // FIXME: Handle DialResult
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
        expect(Connection.mockSend).nthCalledWith(1, msg)
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
        expect(Connection.mockSend).nthCalledWith(1, msg)
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
        expect(Connection.mockSend).nthCalledWith(1, msg)
        done()
      })
      // @ts-ignore
      session.calling.notificationHandler(_stateNotificationEnded)
    })

    describe('recording methods', () => {
      const record = { audio: { format: 'mp3', beep: true } }
      const getMsg = () => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.record',
        params: {
          node_id: call.nodeId,
          call_id: call.id,
          control_id: 'mocked-uuid',
          record
        }
      })

      it('.record() should wait until the recording ends', done => {
        call.record(record).then(result => {
          expect(result).toBeInstanceOf(RecordResult)
          // expect(result.succeeded).toBe(true)
          // expect(result.failed).toBe(false)
          expect(Connection.mockSend).nthCalledWith(1, getMsg())
          done()
        })
        // @ts-ignore
        session.calling.notificationHandler(_recordNotification)
      })

      it('.recordAsync() should return a RecordAction for async control', async done => {
        const action = await call.recordAsync(record)
        expect(action).toBeInstanceOf(RecordAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg())
        // @ts-ignore
        session.calling.notificationHandler(_recordNotification)
        expect(action.completed).toBe(true)
        done()
      })

    })

    describe('connect methods', () => {
      const _tmpDevices = [
        { type: 'phone', to: '999', from: '231', timeout: 10 },
        { type: 'phone', to: '888', from: '234', timeout: 20 }
      ]
      const getMsg = (serial: boolean) => {
        let devices = []
        if (serial) {
          devices = [
            [ { type: 'phone', params: { to_number: '999', from_number: '231', timeout: 10 } } ],
            [ { type: 'phone', params: { to_number: '888', from_number: '234', timeout: 20 } } ]
          ]
        } else {
          devices = [
            [
              { type: 'phone', params: { to_number: '999', from_number: '231', timeout: 10 } },
              { type: 'phone', params: { to_number: '888', from_number: '234', timeout: 20 } }
            ]
          ]
        }
        return new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'call.connect',
          params: { node_id: call.nodeId, call_id: call.id, devices }
        })
      }

      it('.connect() in serial should wait until the call is connected', done => {
        call.connect(..._tmpDevices).then(result => {
          expect(result).toBeInstanceOf(ConnectResult)
          expect(result.successful).toBe(true)
          expect(result.result).toBe(call.peer)
          expect(Connection.mockSend).nthCalledWith(1, getMsg(true))
          done()
        })
        // @ts-ignore
        session.calling.notificationHandler(_connectNotification)
      })

      it('.connect() in parallel should wait until the call is connected', done => {
        call.connect(_tmpDevices).then(result => {
          expect(result).toBeInstanceOf(ConnectResult)
          expect(result.successful).toBe(true)
          expect(result.result).toBe(call.peer)
          expect(Connection.mockSend).nthCalledWith(1, getMsg(false))
          done()
        })
        // @ts-ignore
        session.calling.notificationHandler(_connectNotification)
      })

      it('.connectAsync() in serial should return a ConnectAction for async control', async done => {
        const action = await call.connectAsync(..._tmpDevices)
        expect(action).toBeInstanceOf(ConnectAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(true))

        // @ts-ignore
        session.calling.notificationHandler(_connectNotification)
        expect(action.completed).toBe(true)

        done()
      })

      it('.connectAsync() in parallel should return a ConnectAction for async control', async done => {
        const action = await call.connectAsync(_tmpDevices)
        expect(action).toBeInstanceOf(ConnectAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(false))

        // @ts-ignore
        session.calling.notificationHandler(_connectNotification)
        expect(action.completed).toBe(true)
        done()
      })

    })

    describe('playing methods', () => {
      const media = [
        { type: 'audio', params: { url: 'audio.mp3' } },
        { type: 'tts', params: { text: 'hello jest' } }
      ]

      const getMsg = (...play: ICallingPlay[]) => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.play',
        params: { node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid', play }
      })

      it('.play() should wait until the playing ends', done => {
        call.play(...media).then(result => {
          expect(result).toBeInstanceOf(PlayResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg(...media))
          done()
        })
        // @ts-ignore
        session.calling.notificationHandler(_playNotification)
      })

      it('.playAsync() should return a PlayAction for async control', async done => {
        const action = await call.playAsync(...media)
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(...media))
        // @ts-ignore
        session.calling.notificationHandler(_playNotification)
        expect(action.completed).toBe(true)
        done()
      })

      it('.playAudio() should wait until the playing ends', done => {
        call.playAudio('audio.mp3').then(result => {
          expect(result).toBeInstanceOf(PlayResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg(media[0]))
          done()
        })
        // @ts-ignore
        session.calling.notificationHandler(_playNotification)
      })

      it('.playAudioAsync() should return a PlayAction for async control', async done => {
        const action = await call.playAudioAsync('audio.mp3')
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(media[0]))
        // @ts-ignore
        session.calling.notificationHandler(_playNotification)
        expect(action.completed).toBe(true)
        done()
      })

      it('.playTTS() should wait until the playing ends', done => {
        call.playTTS({ text: 'hello jest' }).then(result => {
          expect(result).toBeInstanceOf(PlayResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg(media[1]))
          done()
        })
        // @ts-ignore
        session.calling.notificationHandler(_playNotification)
      })

      it('.playTTSAsync() should return a PlayAction for async control', async done => {
        const action = await call.playTTSAsync({ text: 'hello jest' })
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(media[1]))
        // @ts-ignore
        session.calling.notificationHandler(_playNotification)
        expect(action.completed).toBe(true)
        done()
      })

      it('.playSilence() should wait until the playing ends', done => {
        call.playSilence(5).then(result => {
          expect(result).toBeInstanceOf(PlayResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg({ type: 'silence', params: { duration: 5 } }))
          done()
        })
        // @ts-ignore
        session.calling.notificationHandler(_playNotification)
      })

      it('.playSilenceAsync() should return a PlayAction for async control', async done => {
        const action = await call.playSilenceAsync(5)
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg({ type: 'silence', params: { duration: 5 } }))
        // @ts-ignore
        session.calling.notificationHandler(_playNotification)
        expect(action.completed).toBe(true)
        done()
      })

    })

    describe('collecting methods', () => {
      const collect = { initial_timeout: 10, digits: { max: 5, terminators: '#', digit_timeout: 10 } }
      const audio = { type: 'audio', params: { url: 'audio.mp3' } }
      const tts = { type: 'tts', params: { text: 'hello jest' } }

      const getMsg = (...play: ICallingPlay[]) => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.play_and_collect',
        params: { node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid', collect, play }
      })

      it('.prompt() should wait until the playing ends', done => {
        call.prompt(collect, audio).then(result => {
          expect(result).toBeInstanceOf(PromptResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg(audio))
          done()
        })
        // @ts-ignore
        session.calling.notificationHandler(_collectNotification)
      })

      it('.promptAsync() should return a PromptAction for async control', async done => {
        const action = await call.promptAsync(collect, audio)
        expect(action).toBeInstanceOf(PromptAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(audio))
        // @ts-ignore
        session.calling.notificationHandler(_collectNotification)
        expect(action.completed).toBe(true)
        done()
      })

      it('.promptAudio() should wait until the playing ends', done => {
        call.promptAudio(collect, 'audio.mp3').then(result => {
          expect(result).toBeInstanceOf(PromptResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg(audio))
          done()
        })
        // @ts-ignore
        session.calling.notificationHandler(_collectNotification)
      })

      it('.promptAudioAsync() should return a PromptAction for async control', async done => {
        const action = await call.promptAudioAsync(collect, 'audio.mp3')
        expect(action).toBeInstanceOf(PromptAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(audio))
        // @ts-ignore
        session.calling.notificationHandler(_collectNotification)
        expect(action.completed).toBe(true)
        done()
      })

      it('.promptTTS() should wait until the collect finished', done => {
        call.promptTTS(collect, { text: 'hello jest' }).then(result => {
          expect(result).toBeInstanceOf(PromptResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg(tts))
          done()
        })
        // @ts-ignore
        session.calling.notificationHandler(_collectNotification)
      })

      it('.promptTTSAsync() should return a PromptAction for async control', async done => {
        const action = await call.promptTTSAsync(collect, { text: 'hello jest' })
        expect(action).toBeInstanceOf(PromptAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(tts))
        // @ts-ignore
        session.calling.notificationHandler(_collectNotification)
        expect(action.completed).toBe(true)
        done()
      })

    })

  })
})
