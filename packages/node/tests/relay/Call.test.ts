import RelayClient from '../../src/relay'
import { ICallDevice, ICallingPlay } from '../../../common/src/util/interfaces'
import Call from '../../../common/src/relay/calling/Call'
import { CallState } from '../../../common/src/util/constants/relay'
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
import DialResult from '../../../common/src/relay/calling/results/DialResult'
// import Event from '../../../common/src/relay/calling/Event'
import FaxResult from '../../../common/src/relay/calling/results/FaxResult'
import FaxAction from '../../../common/src/relay/calling/actions/FaxAction'
import DetectResult from '../../../common/src/relay/calling/results/DetectResult'
import DetectAction from '../../../common/src/relay/calling/actions/DetectAction'
jest.mock('../../../common/src/services/Connection')

describe('Call', () => {
  const device: ICallDevice = { type: 'phone', params: { from_number: '2345', to_number: '6789', timeout: 30 } }
  const session: RelayClient = new RelayClient({ host: 'example.signalwire.com', project: 'project', token: 'token' })
  session.__logger.setLevel(session.__logger.levels.SILENT)
  // @ts-ignore
  session.connection = Connection.default()
  session.relayProtocol = 'signalwire_service_random_uuid'

  let call: Call = null

  beforeEach(() => {
    Connection.mockSend.mockClear()
    // @ts-ignore
    session.calling._calls = []
    call = new Call(session.calling, { device })
    // @ts-ignore
    call._components = []
  })

  it('should create the Call object with no id and nodeId', () => {
    expect(call.state).toEqual('none')
    expect(call.id).toBeUndefined()
    expect(call.nodeId).toBeUndefined()
  })

  it('should add the call to the cache array', () => {
    // @ts-ignore
    expect(session.calling._calls).toContain(call)
  })

  it('should not have peers', () => {
    expect(call.peer).toBeUndefined()
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

  describe('with success response code 200', () => {

    const _stateNotificationAnswered = JSON.parse(`{"event_type":"calling.call.state","params":{"call_state":"answered","direction":"inbound","device":{"type":"phone","params":{"from_number":"+1234","to_number":"15678"}},"call_id":"call-id","node_id":"node-id"}}`)
    const _stateNotificationEnded = JSON.parse(`{"event_type":"calling.call.state","params":{"call_state":"ended","end_reason":"busy","direction":"inbound","device":{"type":"phone","params":{"from_number":"+1234","to_number":"15678"}},"call_id":"call-id","node_id":"node-id"}}`)
    const _recordNotification = JSON.parse(`{"event_type":"calling.call.record","params":{"state":"finished","record":{"audio":{"format":"mp3","direction":"speak","stereo":false}},"url":"record.mp3","control_id":"mocked-uuid","size":4096,"duration":4,"call_id":"call-id","node_id":"node-id"}}`)
    const _connectNotification = JSON.parse(`{"event_type":"calling.call.connect","params":{"connect_state":"connected","peer":{"call_id":"peer-call-id","node_id":"peer-node-id","device":{"type":"phone","params":{"from_number":"+1234","to_number":"+15678"}}},"call_id":"call-id","node_id":"node-id"}}`)
    const _connectNotificationPeerCreated = JSON.parse('{"event_type":"calling.call.state","params":{"call_state":"created","direction":"outbound","device":{"type":"phone","params":{"from_number":"+1234","to_number":"15678"}},"peer":{"call_id":"call-id","node_id":"node-id"},"call_id":"peer-call-id","node_id":"peer-node-id"}}')
    const _playNotification = JSON.parse(`{"event_type":"calling.call.play","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","state":"finished"}}`)
    const _collectNotification = JSON.parse(`{"event_type":"calling.call.collect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","result":{"type":"digit","params":{"digits":"12345","terminator":"#"}}}}`)
    const _faxNotificationFinished = JSON.parse('{"event_type":"calling.call.fax","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","fax":{"type":"finished","params":{"direction":"send","identity":"+1xxx","remote_identity":"+1yyy","document":"file.pdf","success":true,"result":"1231","result_text":"","pages":"1"}}}}')

    beforeEach(() => {
      call.id = 'call-id'
      call.nodeId = 'node-id'
      call.state = CallState.Created
      Connection.mockResponse.mockReturnValueOnce(JSON.parse('{"id":"uuid","jsonrpc":"2.0","result":{"result":{"code":"200","message":"message","control_id":"control-id"}}}'))
    })

    it('.dial() should wait for "answered" event', done => {
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.begin',
        params: { tag: 'mocked-uuid', device: call.device }
      })
      call.dial().then(result => {
        expect(result).toBeInstanceOf(DialResult)
        expect(result.successful).toBe(true)
        expect(result.event.name).toEqual('answered')
        expect(result.call).toEqual(call)
        expect(Connection.mockSend).nthCalledWith(1, msg)
        done()
      })
      session.calling.notificationHandler(_stateNotificationAnswered)
    })

    it('.answer() should wait for "answered" event', done => {
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.answer',
        params: { node_id: call.nodeId, call_id: call.id }
      })
      call.answer().then(result => {
        expect(result).toBeInstanceOf(AnswerResult)
        expect(result.successful).toBe(true)
        expect(result.event.name).toEqual('answered')
        expect(Connection.mockSend).nthCalledWith(1, msg)
        done()
      })
      session.calling.notificationHandler(_stateNotificationAnswered)
    })

    it('.hangup() should wait for "ended" event', done => {
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.end',
        params: { node_id: call.nodeId, call_id: call.id, reason: 'busy' }
      })
      call.hangup('busy').then(result => {
        expect(result).toBeInstanceOf(HangupResult)
        expect(result.successful).toBe(true)
        expect(result.reason).toEqual('busy')
        expect(result.event.name).toEqual('ended')
        expect(Connection.mockSend).nthCalledWith(1, msg)
        done()
      })
      session.calling.notificationHandler(_stateNotificationEnded)
    })

    describe('recording methods', () => {
      const record = { audio: { format: 'mp3', beep: true } }
      const getMsg = () => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.record',
        params: { node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid', record }
      })

      it('.record() should wait until the recording ends', done => {
        call.record(record).then(result => {
          expect(result).toBeInstanceOf(RecordResult)
          expect(result.successful).toBe(true)
          expect(result.url).toEqual('record.mp3')
          expect(Connection.mockSend).nthCalledWith(1, getMsg())
          done()
        })
        session.calling.notificationHandler(_recordNotification)
      })

      it('.recordAsync() should return a RecordAction for async control', async done => {
        const action = await call.recordAsync(record)
        expect(action).toBeInstanceOf(RecordAction)
        expect(action.completed).toBe(false)
        expect(action.result).toBeInstanceOf(RecordResult)
        expect(Connection.mockSend).nthCalledWith(1, getMsg())
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
          expect(result.call).toBe(call.peer)
          expect(result.call.id).toEqual('peer-call-id')
          expect(Connection.mockSend).nthCalledWith(1, getMsg(true))
          done()
        })
        session.calling.notificationHandler(_connectNotificationPeerCreated)
        session.calling.notificationHandler(_connectNotification)
      })

      it('.connect() in parallel should wait until the call is connected', done => {
        call.connect(_tmpDevices).then(result => {
          expect(result).toBeInstanceOf(ConnectResult)
          expect(result.successful).toBe(true)
          expect(result.call).toBe(call.peer)
          expect(result.call.id).toEqual('peer-call-id')
          expect(Connection.mockSend).nthCalledWith(1, getMsg(false))
          done()
        })
        session.calling.notificationHandler(_connectNotificationPeerCreated)
        session.calling.notificationHandler(_connectNotification)
      })

      it('.connectAsync() in serial should return a ConnectAction for async control', async done => {
        const action = await call.connectAsync(..._tmpDevices)
        expect(action).toBeInstanceOf(ConnectAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(true))

        session.calling.notificationHandler(_connectNotificationPeerCreated)
        session.calling.notificationHandler(_connectNotification)
        expect(action.result.call.id).toEqual('peer-call-id')
        expect(action.completed).toBe(true)

        done()
      })

      it('.connectAsync() in parallel should return a ConnectAction for async control', async done => {
        const action = await call.connectAsync(_tmpDevices)
        expect(action).toBeInstanceOf(ConnectAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(false))

        session.calling.notificationHandler(_connectNotificationPeerCreated)
        session.calling.notificationHandler(_connectNotification)
        expect(action.result.call.id).toEqual('peer-call-id')
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
        session.calling.notificationHandler(_playNotification)
      })

      it('.playAsync() should return a PlayAction for async control', async done => {
        const action = await call.playAsync(...media)
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(...media))
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
        session.calling.notificationHandler(_playNotification)
      })

      it('.playAudioAsync() should return a PlayAction for async control', async done => {
        const action = await call.playAudioAsync('audio.mp3')
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(media[0]))
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
        session.calling.notificationHandler(_playNotification)
      })

      it('.playTTSAsync() should return a PlayAction for async control', async done => {
        const action = await call.playTTSAsync({ text: 'hello jest' })
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(media[1]))
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
        session.calling.notificationHandler(_playNotification)
      })

      it('.playSilenceAsync() should return a PlayAction for async control', async done => {
        const action = await call.playSilenceAsync(5)
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg({ type: 'silence', params: { duration: 5 } }))
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
          expect(result.terminator).toEqual('#')
          expect(result.result).toEqual('12345')
          expect(Connection.mockSend).nthCalledWith(1, getMsg(audio))
          done()
        })
        session.calling.notificationHandler(_collectNotification)
      })

      it('.promptAsync() should return a PromptAction for async control', async done => {
        const action = await call.promptAsync(collect, audio)
        expect(action).toBeInstanceOf(PromptAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(audio))
        session.calling.notificationHandler(_collectNotification)
        expect(action.completed).toBe(true)
        done()
      })

      it('.promptAudio() should wait until the playing ends', done => {
        call.promptAudio(collect, 'audio.mp3').then(result => {
          expect(result).toBeInstanceOf(PromptResult)
          expect(result.successful).toBe(true)
          expect(result.terminator).toEqual('#')
          expect(result.result).toEqual('12345')
          expect(Connection.mockSend).nthCalledWith(1, getMsg(audio))
          done()
        })
        session.calling.notificationHandler(_collectNotification)
      })

      it('.promptAudioAsync() should return a PromptAction for async control', async done => {
        const action = await call.promptAudioAsync(collect, 'audio.mp3')
        expect(action).toBeInstanceOf(PromptAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(audio))
        session.calling.notificationHandler(_collectNotification)
        expect(action.completed).toBe(true)
        done()
      })

      it('.promptTTS() should wait until the collect finished', done => {
        call.promptTTS(collect, { text: 'hello jest' }).then(result => {
          expect(result).toBeInstanceOf(PromptResult)
          expect(result.successful).toBe(true)
          expect(result.terminator).toEqual('#')
          expect(result.result).toEqual('12345')
          expect(Connection.mockSend).nthCalledWith(1, getMsg(tts))
          done()
        })
        session.calling.notificationHandler(_collectNotification)
      })

      it('.promptTTSAsync() should return a PromptAction for async control', async done => {
        const action = await call.promptTTSAsync(collect, { text: 'hello jest' })
        expect(action).toBeInstanceOf(PromptAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(tts))
        session.calling.notificationHandler(_collectNotification)
        expect(action.completed).toBe(true)
        done()
      })

    })

    describe('waitFor methods', () => {

      beforeEach(Connection.mockResponse) // Force-consume mock request because waitFor does not make requests.

      it('it should wait for answered event', done => {
        call.waitFor('answered').then(check => {
          expect(check).toBe(true)
          done()
        })
        session.calling.notificationHandler(_stateNotificationAnswered)
      })

      it('it should handle events already passed', done => {
        call.state = 'answered'
        call.waitFor('ringing', 'answered').then(check => {
          expect(check).toBe(true)
          done()
        })
      })

      it('it should wait for ended event', done => {
        call.waitFor('ended').then(check => {
          expect(check).toBe(true)
          done()
        })
        session.calling.notificationHandler(_stateNotificationEnded)
      })

      it('it should handle events that will never arrive', done => {
        call.waitFor('answered').then(check => {
          expect(check).toBe(false)
          done()
        })
        session.calling.notificationHandler(_stateNotificationEnded)
      })
    })

    describe('faxReceive methods', () => {
      const getMsg = () => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.receive_fax',
        params: { node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid' }
      })

      it('.faxReceive() should wait until the playing ends', done => {
        call.faxReceive().then(result => {
          expect(result).toBeInstanceOf(FaxResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg())
          done()
        })
        session.calling.notificationHandler(_faxNotificationFinished)
      })

      it('.faxReceiveAsync() should return a FaxAction for async control', async done => {
        const action = await call.faxReceiveAsync()
        expect(action).toBeInstanceOf(FaxAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg())
        session.calling.notificationHandler(_faxNotificationFinished)
        expect(action.completed).toBe(true)
        done()
      })

    })

    describe('faxSend methods', () => {
      const getMsg = () => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.send_fax',
        params: { node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid', document: 'document.pdf', header_info: 'custom' }
      })

      it('.faxSend() should wait until the playing ends', done => {
        call.faxSend('document.pdf', null, 'custom').then(result => {
          expect(result).toBeInstanceOf(FaxResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg())
          done()
        })
        session.calling.notificationHandler(_faxNotificationFinished)
      })

      it('.faxSendAsync() should return a FaxAction for async control', async done => {
        const action = await call.faxSendAsync('document.pdf', null, 'custom')
        expect(action).toBeInstanceOf(FaxAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg())
        session.calling.notificationHandler(_faxNotificationFinished)
        expect(action.completed).toBe(true)
        done()
      })

    })

    describe('detect methods', () => {
      const _notificationFaxCED = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"fax","params":{"event":"CED"}}}}');
      // const _notificationFaxError = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"fax","params":{"event":"error"}}}}');
      const _notificationFaxFinished = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"fax","params":{"event":"finished"}}}}');

      const _notificationMachineHuman = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"machine","params":{"event":"HUMAN"}}}}');
      // const _notificationMachineError = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"machine","params":{"event":"error"}}}}');
      const _notificationMachineFinished = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"machine","params":{"event":"finished"}}}}');

      const _notificationDigitDTMF = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"digit","params":{"event":"1#"}}}}');
      // const _notificationDigitError = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"digit","params":{"event":"error"}}}}');
      const _notificationDigitFinished = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"digit","params":{"event":"finished"}}}}');
      const getMsg = (type: string, params: any, timeout = 30) => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.detect',
        params: { node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid', detect: { type, params }, timeout }
      })

      it('.detect() should wait until the detect ends', done => {
        call.detect('fax', null, 30).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(true)
          expect(result.type).toBe('fax')
          expect(result.result).toBe('CED')
          expect(Connection.mockSend).nthCalledWith(1, getMsg('fax', {}))
          done()
        })
        session.calling.notificationHandler(_notificationFaxCED)
        session.calling.notificationHandler(_notificationFaxFinished)
      })

      it('.detectAsync() should return a DetectAction for async control', async done => {
        const action = await call.detectAsync('fax', null, 30)
        expect(action).toBeInstanceOf(DetectAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('fax', {}))
        session.calling.notificationHandler(_notificationFaxFinished)
        expect(action.completed).toBe(true)
        done()
      })

      it('.detectMachine() should wait until the detect ends', done => {
        const params = { initial_timeout: 5 }
        call.detectMachine(params, 30).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(true)
          expect(result.type).toBe('machine')
          expect(result.result).toBe('HUMAN')
          expect(Connection.mockSend).nthCalledWith(1, getMsg('machine', params))
          done()
        })
        session.calling.notificationHandler(_notificationMachineHuman)
        session.calling.notificationHandler(_notificationMachineFinished)
      })

      it('.detectMachineAsync() should return a DetectAction for async control', async done => {
        const params = { initial_timeout: 5 }
        const action = await call.detectMachineAsync(params, 30)
        expect(action).toBeInstanceOf(DetectAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('machine', params))
        session.calling.notificationHandler(_notificationMachineFinished)
        expect(action.completed).toBe(true)
        done()
      })

      it('.detectFax() should wait until the detect ends', done => {
        call.detectFax(null, 30).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(true)
          expect(result.type).toBe('fax')
          expect(result.result).toBe('CED')
          expect(Connection.mockSend).nthCalledWith(1, getMsg('fax', {}))
          done()
        })
        session.calling.notificationHandler(_notificationFaxCED)
        session.calling.notificationHandler(_notificationFaxFinished)
      })

      it('.detectFaxAsync() should return a DetectAction for async control', async done => {
        const action = await call.detectFaxAsync('CED', 30)
        expect(action).toBeInstanceOf(DetectAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('fax', { tone: 'CED' }))
        session.calling.notificationHandler(_notificationFaxFinished)
        expect(action.completed).toBe(true)
        done()
      })

      it('.detectDigit() should wait until the detect ends', done => {
        call.detectDigit('', 30).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(true)
          expect(result.type).toBe('digit')
          expect(result.result).toBe('1#')
          expect(Connection.mockSend).nthCalledWith(1, getMsg('digit', {}))
          done()
        })
        session.calling.notificationHandler(_notificationDigitDTMF)
        session.calling.notificationHandler(_notificationDigitFinished)
      })

      it('.detectDigitAsync() should return a DetectAction for async control', async done => {
        const action = await call.detectDigitAsync('12', 30)
        expect(action).toBeInstanceOf(DetectAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('digit', { digits: '12' }))
        session.calling.notificationHandler(_notificationDigitFinished)
        expect(action.completed).toBe(true)
        done()
      })

    })

  })

  describe('with fail response code not 200', () => {

    beforeEach(() => {
      call.id = 'call-id'
      call.nodeId = 'node-id'
      call.state = CallState.Created
      Connection.mockResponse.mockReturnValueOnce(JSON.parse('{"id":"uuid","jsonrpc":"2.0","result":{"result":{"code":"400","message":"some error","control_id":"control-id"}}}'))
    })

    it('.dial() should wait for "answered" event', done => {
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.begin',
        params: { tag: 'mocked-uuid', device: call.device }
      })
      call.dial().then(result => {
        expect(result).toBeInstanceOf(DialResult)
        expect(result.successful).toBe(false)
        expect(result.call).toEqual(call)
        expect(Connection.mockSend).nthCalledWith(1, msg)
        done()
      })
    })

    it('.answer() should wait for "answered" event', done => {
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.answer',
        params: { node_id: call.nodeId, call_id: call.id }
      })
      call.answer().then(result => {
        expect(result).toBeInstanceOf(AnswerResult)
        expect(result.successful).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, msg)
        done()
      })
    })

    it('.hangup() should wait for "ended" event', done => {
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.end',
        params: { node_id: call.nodeId, call_id: call.id, reason: 'busy' }
      })
      call.hangup('busy').then(result => {
        expect(result).toBeInstanceOf(HangupResult)
        expect(result.successful).toBe(false)
        expect(result.reason).toEqual('busy')
        expect(Connection.mockSend).nthCalledWith(1, msg)
        done()
      })
    })

    describe('recording methods', () => {
      const record = { audio: { format: 'mp3', beep: true } }
      const getMsg = () => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.record',
        params: { node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid', record }
      })

      it('.record() should wait until the recording ends', done => {
        call.record(record).then(result => {
          expect(result).toBeInstanceOf(RecordResult)
          expect(result.successful).toBe(false)
          expect(result.url).toBeUndefined()
          expect(Connection.mockSend).nthCalledWith(1, getMsg())
          done()
        })
      })

      it('.recordAsync() should return a RecordAction for async control', async done => {
        const action = await call.recordAsync(record)
        expect(action).toBeInstanceOf(RecordAction)
        expect(action.completed).toBe(true)
        expect(action.result).toBeInstanceOf(RecordResult)
        expect(Connection.mockSend).nthCalledWith(1, getMsg())
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
            [{ type: 'phone', params: { to_number: '999', from_number: '231', timeout: 10 } }],
            [{ type: 'phone', params: { to_number: '888', from_number: '234', timeout: 20 } }]
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
          expect(result.successful).toBe(false)
          expect(result.call).toBeUndefined()
          expect(Connection.mockSend).nthCalledWith(1, getMsg(true))
          done()
        })
      })

      it('.connect() in parallel should wait until the call is connected', done => {
        call.connect(_tmpDevices).then(result => {
          expect(result).toBeInstanceOf(ConnectResult)
          expect(result.successful).toBe(false)
          expect(result.call).toBeUndefined()
          expect(Connection.mockSend).nthCalledWith(1, getMsg(false))
          done()
        })
      })

      it('.connectAsync() in serial should return a ConnectAction for async control', async done => {
        const action = await call.connectAsync(..._tmpDevices)
        expect(action).toBeInstanceOf(ConnectAction)
        expect(action.completed).toBe(true)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(true))
        expect(action.result.call).toBeUndefined()
        done()
      })

      it('.connectAsync() in parallel should return a ConnectAction for async control', async done => {
        const action = await call.connectAsync(_tmpDevices)
        expect(action).toBeInstanceOf(ConnectAction)
        expect(action.completed).toBe(true)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(false))
        expect(action.result.call).toBeUndefined()
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
          expect(result.successful).toBe(false)
          expect(Connection.mockSend).nthCalledWith(1, getMsg(...media))
          done()
        })
      })

      it('.playAsync() should return a PlayAction for async control', async done => {
        const action = await call.playAsync(...media)
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(true)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(...media))
        done()
      })

    })

    describe('collecting methods', () => {
      const collect = { initial_timeout: 10, digits: { max: 5, terminators: '#', digit_timeout: 10 } }
      const audio = { type: 'audio', params: { url: 'audio.mp3' } }

      const getMsg = (...play: ICallingPlay[]) => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.play_and_collect',
        params: { node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid', collect, play }
      })

      it('.prompt() should wait until the collect ends', done => {
        call.prompt(collect, audio).then(result => {
          expect(result).toBeInstanceOf(PromptResult)
          expect(result.successful).toBe(false)
          expect(result.terminator).toBeUndefined()
          expect(result.result).toBeUndefined()
          expect(Connection.mockSend).nthCalledWith(1, getMsg(audio))
          done()
        })
      })

      it('.promptAsync() should return a PromptAction for async control', async done => {
        const action = await call.promptAsync(collect, audio)
        expect(action).toBeInstanceOf(PromptAction)
        expect(action.completed).toBe(true)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(audio))
        done()
      })

    })

    describe('faxReceive methods', () => {
      const getMsg = () => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.receive_fax',
        params: { node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid' }
      })

      it('.faxReceive() should wait until the playing ends', done => {
        call.faxReceive().then(result => {
          expect(result).toBeInstanceOf(FaxResult)
          expect(result.successful).toBe(false)
          expect(Connection.mockSend).nthCalledWith(1, getMsg())
          done()
        })
      })

      it('.faxReceiveAsync() should return a FaxAction for async control', async done => {
        const action = await call.faxReceiveAsync()
        expect(action).toBeInstanceOf(FaxAction)
        expect(action.completed).toBe(true)
        expect(Connection.mockSend).nthCalledWith(1, getMsg())
        done()
      })

    })

    describe('faxSend methods', () => {
      const getMsg = () => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.send_fax',
        params: { node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid', document: 'document.pdf', header_info: 'custom' }
      })

      it('.faxSend() should wait until the playing ends', done => {
        call.faxSend('document.pdf', null, 'custom').then(result => {
          expect(result).toBeInstanceOf(FaxResult)
          expect(result.successful).toBe(false)
          expect(Connection.mockSend).nthCalledWith(1, getMsg())
          done()
        })
      })

      it('.faxSendAsync() should return a FaxAction for async control', async done => {
        const action = await call.faxSendAsync('document.pdf', null, 'custom')
        expect(action).toBeInstanceOf(FaxAction)
        expect(action.completed).toBe(true)
        expect(Connection.mockSend).nthCalledWith(1, getMsg())
        done()
      })

    })

    describe('detect methods', () => {
      const getMsg = (type: string, params: any, timeout = 30) => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.detect',
        params: { node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid', detect: { type, params }, timeout }
      })

      it('.detect() should resolve the Promise with no-success response', done => {
        call.detect('fax', null, 30).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(false)
          expect(result.type).toBeUndefined()
          expect(result.result).toBeUndefined()
          expect(Connection.mockSend).nthCalledWith(1, getMsg('fax', {}))
          done()
        })
      })

      it('.detectAsync() should return a DetectAction for async control', async done => {
        const action = await call.detectAsync('fax', null, 30)
        expect(action).toBeInstanceOf(DetectAction)
        expect(action.completed).toBe(true)
        expect(action.result).toBeInstanceOf(DetectResult)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('fax', {}))
        done()
      })

      it('.detectMachine() should resolve the Promise with no-success response', done => {
        call.detectMachine(null, 30).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(false)
          expect(result.type).toBeUndefined()
          expect(result.result).toBeUndefined()
          expect(Connection.mockSend).nthCalledWith(1, getMsg('machine', {}))
          done()
        })
      })

      it('.detectMachineAsync() should return a DetectAction for async control', async done => {
        const action = await call.detectMachineAsync(null, 30)
        expect(action).toBeInstanceOf(DetectAction)
        expect(action.completed).toBe(true)
        expect(action.result).toBeInstanceOf(DetectResult)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('machine', {}))
        done()
      })

      it('.detectFax() should resolve the Promise with no-success response', done => {
        call.detectFax(null, 30).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(false)
          expect(result.type).toBeUndefined()
          expect(result.result).toBeUndefined()
          expect(Connection.mockSend).nthCalledWith(1, getMsg('fax', {}))
          done()
        })
      })

      it('.detectFaxAsync() should return a DetectAction for async control', async done => {
        const action = await call.detectFaxAsync(null, 30)
        expect(action).toBeInstanceOf(DetectAction)
        expect(action.completed).toBe(true)
        expect(action.result).toBeInstanceOf(DetectResult)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('fax', {}))
        done()
      })

      it('.detectDigit() should resolve the Promise with no-success response', done => {
        call.detectDigit(null, 30).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(false)
          expect(result.type).toBeUndefined()
          expect(result.result).toBeUndefined()
          expect(Connection.mockSend).nthCalledWith(1, getMsg('digit', {}))
          done()
        })
      })

      it('.detectDigitAsync() should return a DetectAction for async control', async done => {
        const action = await call.detectDigitAsync(null, 30)
        expect(action).toBeInstanceOf(DetectAction)
        expect(action.completed).toBe(true)
        expect(action.result).toBeInstanceOf(DetectResult)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('digit', {}))
        done()
      })

    })

  })
})
