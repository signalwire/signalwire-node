import RelayClient from '../../src/relay'
import { ICallingPlay, IRelayCallingTapDevice, ICallingTapTap, ICallingTapDevice, IRelayCallingPlay, ICallingTapFlat } from '../../../common/src/relay/calling/interfaces'
import Call from '../../../common/src/relay/calling/Call'
import { CallState, CallType } from '../../../common/src/relay/calling/constants'
import { Execute } from '../../../common/src/messages/Blade'
import { RecordAction, PlayAction, PromptAction, ConnectAction, FaxAction, DetectAction, TapAction, SendDigitsAction } from '../../../common/src/relay/calling/actions'
import { HangupResult, RecordResult, AnswerResult, PlayResult, PromptResult, ConnectResult, DialResult, FaxResult, DetectResult, TapResult, SendDigitsResult, DisconnectResult } from '../../../common/src/relay/calling/results'
import { prepareDevices } from '../../../common/src/relay/helpers'
import { buildDevice } from '../../../common/src/relay/calling/devices'
const Connection = require('../../../common/src/services/Connection')
jest.mock('../../../common/src/services/Connection')

describe('Call', () => {
  const targets = prepareDevices([
    { type: CallType.Phone, to: '6789' },
    [
      { type: CallType.Phone, to: '6789' },
      { type: CallType.Agora, to: '6789', appId: 'appid', channel: 'channel' },
      { type: CallType.Sip, to: '6789' }
    ],
    { type: CallType.WebRTC, to: '6789', codecs: ['OPUS'] }
  ])
  const device = buildDevice({ type: CallType.Phone, to: '6789' })
  const session = new RelayClient({ project: 'project', token: 'token' })
  session.__logger.setLevel(session.__logger.levels.SILENT)
  // @ts-ignore
  session.connection = Connection.default()
  session.relayProtocol = 'signalwire_service_random_uuid'

  let call: Call = null

  beforeEach(() => {
    Connection.mockSend.mockClear()
    // @ts-ignore
    session.calling._calls = []
    call = new Call(session.calling, { targets })
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

  it('should expose the proper alias methods', () => {
    expect(call.amd).toBeInstanceOf(Function)
    expect(call.amdAsync).toBeInstanceOf(Function)
  })

  describe('.on()', () => {
    it('should be chainable', () => {
      expect(call.on('created', jest.fn())).toBe(call)
    })

    it('should save callback in the stack', () => {
      const mockFn = jest.fn()
      call.on('created', mockFn)
      call.on('answered', mockFn)
      call._stateChange({ call_state: 'created', device })
      call._stateChange({ call_state: 'answered', device })
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
      call._stateChange({ call_state: 'created', device })
      expect(mockFn).not.toHaveBeenCalled()
    })
  })

  describe('with success response code 200', () => {

    const _stateNotificationAnswered = JSON.parse(`{"event_type":"calling.call.state","params":{"call_state":"answered","direction":"inbound","device":{"type":"phone","params":{"from_number":"+1234","to_number":"15678"}},"call_id":"call-id","node_id":"node-id"}}`)
    const _stateNotificationEnding = JSON.parse(`{"event_type":"calling.call.state","params":{"call_state":"ending","end_reason":"busy","direction":"inbound","device":{"type":"phone","params":{"from_number":"+1234","to_number":"15678"}},"call_id":"call-id","node_id":"node-id"}}`)
    const _stateNotificationEnded = JSON.parse(`{"event_type":"calling.call.state","params":{"call_state":"ended","end_reason":"busy","direction":"inbound","device":{"type":"phone","params":{"from_number":"+1234","to_number":"15678"}},"call_id":"call-id","node_id":"node-id"}}`)
    const _recordNotification = JSON.parse(`{"event_type":"calling.call.record","params":{"state":"finished","record":{"audio":{"format":"mp3","direction":"speak","stereo":false}},"url":"record.mp3","control_id":"mocked-uuid","size":4096,"duration":4,"call_id":"call-id","node_id":"node-id"}}`)
    const _connectNotification = JSON.parse(`{"event_type":"calling.call.connect","params":{"connect_state":"connected","peer":{"call_id":"peer-call-id","node_id":"peer-node-id","device":{"type":"phone","params":{"from_number":"+1234","to_number":"+15678"}}},"call_id":"call-id","node_id":"node-id"}}`)
    const _connectNotificationPeerCreated = JSON.parse('{"event_type":"calling.call.state","params":{"call_state":"created","direction":"outbound","device":{"type":"phone","params":{"from_number":"+1234","to_number":"15678"}},"peer":{"call_id":"call-id","node_id":"node-id"},"call_id":"peer-call-id","node_id":"peer-node-id"}}')
    const _connectNotificationDisconnected = JSON.parse(`{"event_type":"calling.call.connect","params":{"connect_state":"disconnected","peer":{"call_id":"peer-call-id","node_id":"peer-node-id","device":{"type":"phone","params":{"from_number":"+1234","to_number":"+15678"}}},"call_id":"call-id","node_id":"node-id"}}`)
    const _playNotification = JSON.parse(`{"event_type":"calling.call.play","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","state":"finished"}}`)
    const _collectNotification = JSON.parse(`{"event_type":"calling.call.collect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","result":{"type":"digit","params":{"digits":"12345","terminator":"#"}}}}`)
    const _faxNotificationFinished = JSON.parse('{"event_type":"calling.call.fax","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","fax":{"type":"finished","params":{"direction":"send","identity":"+1xxx","remote_identity":"+1yyy","document":"file.pdf","success":true,"result":"1231","result_text":"","pages":"1"}}}}')
    const _tapNotificationFinished = JSON.parse('{"event_type":"calling.call.tap","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","state":"finished","tap":{"type":"audio","params":{"direction":"listen"}},"device":{"type":"rtp","params":{"addr":"127.0.0.1","port":"1234","codec":"PCMU","ptime":"20"}}}}')
    const _sendDigitsNotificationFinished = JSON.parse(`{"event_type":"calling.call.send_digits","params":{"control_id":"mocked-uuid","state":"finished","call_id":"call-id","node_id":"node-id"}}`)

    beforeEach(() => {
      call.id = 'call-id'
      call.nodeId = 'node-id'
      call.state = CallState.Created
      Connection.mockResponse.mockReturnValueOnce(JSON.parse('{"id":"uuid","jsonrpc":"2.0","result":{"result":{"code":"200","message":"message","control_id":"control-id","url":"record.mp3"}}}'))
    })

    it('.dial() should wait for "answered" event', done => {
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'calling.dial',
        params: { tag: 'mocked-uuid', devices: targets }
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
        method: 'calling.answer',
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
        method: 'calling.end',
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

    it('.hangup() on an ended call should fail', done => {
      session.calling.notificationHandler(_stateNotificationEnding)
      call.hangup().then(result => {
        expect(result).toBeInstanceOf(HangupResult)
        expect(result.successful).toBe(false)
        expect(Connection.mockSend).not.toHaveBeenCalled()
        Connection.mockResponse() // Force-consume mock request
        done()
      })
    })

    describe('recording methods', () => {
      const record = { audio: { format: 'mp3', beep: true } }
      const getMsg = () => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'calling.record',
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
        expect(action.url).toEqual('record.mp3')
        expect(action.result).toBeInstanceOf(RecordResult)
        expect(Connection.mockSend).nthCalledWith(1, getMsg())
        session.calling.notificationHandler(_recordNotification)
        expect(action.completed).toBe(true)
        done()
      })

    })

    describe('connect methods', () => {
      const _tmpDevices = [
        { type: CallType.Phone, to: '999', from: '231', timeout: 10 },
        { type: CallType.Phone, to: '888', from: '234', timeout: 20 }
      ]
      const getMsg = (serial: boolean, ringback: any = null) => {
        let devices = []
        if (serial) {
          devices = [
            [ { type: CallType.Phone, params: { to_number: '999', from_number: '231', timeout: 10 } } ],
            [ { type: CallType.Phone, params: { to_number: '888', from_number: '234', timeout: 20 } } ]
          ]
        } else {
          devices = [
            [
              { type: CallType.Phone, params: { to_number: '999', from_number: '231', timeout: 10 } },
              { type: CallType.Phone, params: { to_number: '888', from_number: '234', timeout: 20 } }
            ]
          ]
        }
        const params: any = { node_id: call.nodeId, call_id: call.id, devices }
        if (ringback) {
          params.ringback = ringback
        }
        return new Execute({ protocol: 'signalwire_service_random_uuid', method: 'calling.connect', params })
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

      it('.connect() in serial - with ringback - should wait until the call is connected', done => {
        const ringback = { type: 'ringtone', name: 'at', duration: 20 }
        const relayMedia = { type: 'ringtone', params: { name: 'at', duration: 20 } }
        call.connect({ devices: _tmpDevices, ringback }).then(result => {
          expect(result).toBeInstanceOf(ConnectResult)
          expect(result.successful).toBe(true)
          expect(result.call).toBe(call.peer)
          expect(result.call.id).toEqual('peer-call-id')
          expect(Connection.mockSend).nthCalledWith(1, getMsg(true, relayMedia))
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

      it('.connect() in parallel - with ringback - should wait until the call is connected', done => {
        const ringback = { type: 'ringtone', name: 'at', duration: 20 }
        const relayMedia = { type: 'ringtone', params: { name: 'at', duration: 20 } }
        call.connect({ devices: [_tmpDevices], ringback }).then(result => {
          expect(result).toBeInstanceOf(ConnectResult)
          expect(result.successful).toBe(true)
          expect(result.call).toBe(call.peer)
          expect(result.call.id).toEqual('peer-call-id')
          expect(Connection.mockSend).nthCalledWith(1, getMsg(false, relayMedia))
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

      it('.connectAsync() in parallel - with ringback - should return a ConnectAction for async control', async done => {
        const ringback = { type: 'ringtone', name: 'at', duration: 20 }
        const relayMedia = { type: 'ringtone', params: { name: 'at', duration: 20 } }
        const action = await call.connectAsync({ devices: [_tmpDevices], ringback })
        expect(action).toBeInstanceOf(ConnectAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(false, relayMedia))

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

      const getMsg = (play: (ICallingPlay | IRelayCallingPlay)[], volume = 0) => {
        const params: any = { node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid', play }
        if (volume !== 0) params.volume = volume
        return new Execute({ protocol: 'signalwire_service_random_uuid', method: 'calling.play', params })
      }

      it('.play() should wait until the playing ends', done => {
        call.play(...media).then(result => {
          expect(result).toBeInstanceOf(PlayResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg(media))
          done()
        })
        session.calling.notificationHandler(_playNotification)
      })

      it('.playAsync() should return a PlayAction for async control', async done => {
        const action = await call.playAsync(...media)
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(media))
        session.calling.notificationHandler(_playNotification)
        expect(action.completed).toBe(true)
        done()
      })

      it('.play() with the new signature should wait until the playing ends', done => {
        const params = { media, volume: 6.3 }
        call.play(params).then(result => {
          expect(result).toBeInstanceOf(PlayResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg(media, 6.3))
          done()
        })
        session.calling.notificationHandler(_playNotification)
      })

      it('.playAsync() with the new signature should return a PlayAction for async control', async done => {
        const params = { media, volume: 6.3 }
        const action = await call.playAsync(params)
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(media, 6.3))
        session.calling.notificationHandler(_playNotification)
        expect(action.completed).toBe(true)
        done()
      })

      it('.playAudio() should wait until the playing ends', done => {
        call.playAudio('audio.mp3').then(result => {
          expect(result).toBeInstanceOf(PlayResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg([media[0]]))
          done()
        })
        session.calling.notificationHandler(_playNotification)
      })

      it('.playAudioAsync() should return a PlayAction for async control', async done => {
        const action = await call.playAudioAsync('audio.mp3')
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg([media[0]]))
        session.calling.notificationHandler(_playNotification)
        expect(action.completed).toBe(true)
        done()
      })

      it('.playAudio() with volume should wait until the playing ends', done => {
        call.playAudio({ url: 'audio.mp3', volume: 5 }).then(result => {
          expect(result).toBeInstanceOf(PlayResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg([media[0]], 5))
          done()
        })
        session.calling.notificationHandler(_playNotification)
      })

      it('.playAudioAsync() with volume should return a PlayAction for async control', async done => {
        const action = await call.playAudioAsync({ url: 'audio.mp3', volume: 5 })
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg([media[0]], 5))
        session.calling.notificationHandler(_playNotification)
        expect(action.completed).toBe(true)
        done()
      })

      it('.playTTS() should wait until the playing ends', done => {
        call.playTTS({ text: 'hello jest' }).then(result => {
          expect(result).toBeInstanceOf(PlayResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg([media[1]]))
          done()
        })
        session.calling.notificationHandler(_playNotification)
      })

      it('.playTTSAsync() should return a PlayAction for async control', async done => {
        const action = await call.playTTSAsync({ text: 'hello jest' })
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg([media[1]]))
        session.calling.notificationHandler(_playNotification)
        expect(action.completed).toBe(true)
        done()
      })

      it('.playTTS() with volume should wait until the playing ends', done => {
        call.playTTS({ text: 'hello jest', volume: 4 }).then(result => {
          expect(result).toBeInstanceOf(PlayResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg([media[1]], 4))
          done()
        })
        session.calling.notificationHandler(_playNotification)
      })

      it('.playTTSAsync() with volume should return a PlayAction for async control', async done => {
        const action = await call.playTTSAsync({ text: 'hello jest', volume: 4 })
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg([media[1]], 4))
        session.calling.notificationHandler(_playNotification)
        expect(action.completed).toBe(true)
        done()
      })

      it('.playRingtone() should wait until the playing ends', done => {
        call.playRingtone({ name: 'us', duration: 3.4 }).then(result => {
          expect(result).toBeInstanceOf(PlayResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg([{ type: 'ringtone', params: { name: 'us', duration: 3.4 } }]))
          done()
        })
        session.calling.notificationHandler(_playNotification)
      })

      it('.playRingtoneAsync() should return a PlayAction for async control', async done => {
        const action = await call.playRingtoneAsync({ name: 'us', duration: 3.4 })
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg([{ type: 'ringtone', params: { name: 'us', duration: 3.4 } }]))
        session.calling.notificationHandler(_playNotification)
        expect(action.completed).toBe(true)
        done()
      })

      it('.playRingtone() with volume should wait until the playing ends', done => {
        call.playRingtone({ name: 'us', duration: 3.4, volume: 4 }).then(result => {
          expect(result).toBeInstanceOf(PlayResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg([{ type: 'ringtone', params: { name: 'us', duration: 3.4 } }], 4))
          done()
        })
        session.calling.notificationHandler(_playNotification)
      })

      it('.playRingtoneAsync() with volume should return a PlayAction for async control', async done => {
        const action = await call.playRingtoneAsync({ name: 'us', duration: 3.4, volume: 4 })
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg([{ type: 'ringtone', params: { name: 'us', duration: 3.4 } }], 4))
        session.calling.notificationHandler(_playNotification)
        expect(action.completed).toBe(true)
        done()
      })

      it('.playSilence() should wait until the playing ends', done => {
        call.playSilence(5).then(result => {
          expect(result).toBeInstanceOf(PlayResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg([{ type: 'silence', params: { duration: 5 } }]))
          done()
        })
        session.calling.notificationHandler(_playNotification)
      })

      it('.playSilenceAsync() should return a PlayAction for async control', async done => {
        const action = await call.playSilenceAsync(5)
        expect(action).toBeInstanceOf(PlayAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg([{ type: 'silence', params: { duration: 5 } }]))
        session.calling.notificationHandler(_playNotification)
        expect(action.completed).toBe(true)
        done()
      })

    })

    describe('collecting methods', () => {
      const collect = { initial_timeout: 10, digits: { max: 5, terminators: '#', digit_timeout: 10 } }
      const audio = { type: 'audio', params: { url: 'audio.mp3' } }
      const tts = { type: 'tts', params: { text: 'hello jest' } }
      const ringtone = { type: 'ringtone', params: { name: 'at' } }

      const getMsg = (media: ICallingPlay, volume: number = 0) => {
        const params: any = { node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid', collect, play: [media] }
        if (volume != 0) {
          params.volume = volume
        }
        return new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'calling.play_and_collect',
          params
        })
      }

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

      it('.prompt() with volume property should wait until the playing ends', done => {
        let collect = { volume: -4, initial_timeout: 10, digits_max: 5, digits_terminators: '#', digits_timeout: 10 }
        call.prompt(collect, audio).then(result => {
          expect(result).toBeInstanceOf(PromptResult)
          expect(result.successful).toBe(true)
          expect(result.terminator).toEqual('#')
          expect(result.result).toEqual('12345')
          expect(Connection.mockSend).nthCalledWith(1, getMsg(audio, -4))
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

      it('.promptAudioAsync() with volume  should return a PromptAction for async control', async done => {
        let collect = { volume: 6.7, initial_timeout: 10, digits_max: 5, digits_terminators: '#', digits_timeout: 10 }
        const action = await call.promptAudioAsync(collect, 'audio.mp3')
        expect(action).toBeInstanceOf(PromptAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(audio, 6.7))
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

      it('.promptTTS() with volume should wait until the collect finished', done => {
        let collect = { volume: 6.7, initial_timeout: 10, digits_max: 5, digits_terminators: '#', digits_timeout: 10 }
        call.promptTTS(collect, { text: 'hello jest' }).then(result => {
          expect(result).toBeInstanceOf(PromptResult)
          expect(result.successful).toBe(true)
          expect(result.terminator).toEqual('#')
          expect(result.result).toEqual('12345')
          expect(Connection.mockSend).nthCalledWith(1, getMsg(tts, 6.7))
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

      it('.promptRingtone() should wait until the collect finished', done => {
        const params = { name: 'at', initial_timeout: 10, digits_max: 5, digits_terminators: '#', digits_timeout: 10 }
        call.promptRingtone(params).then(result => {
          expect(result).toBeInstanceOf(PromptResult)
          expect(result.successful).toBe(true)
          expect(result.terminator).toEqual('#')
          expect(result.result).toEqual('12345')
          expect(Connection.mockSend).nthCalledWith(1, getMsg(ringtone))
          done()
        })
        session.calling.notificationHandler(_collectNotification)
      })

      it('.promptRingtone() with volume should wait until the collect finished', done => {
        const params = { name: 'at', duration: 4, volume: 6.7, initial_timeout: 10, digits_max: 5, digits_terminators: '#', digits_timeout: 10 }
        call.promptRingtone(params).then(result => {
          expect(result).toBeInstanceOf(PromptResult)
          expect(result.successful).toBe(true)
          expect(result.terminator).toEqual('#')
          expect(result.result).toEqual('12345')
          const ringtone = { type: 'ringtone', params: { name: 'at', duration: 4 } }
          expect(Connection.mockSend).nthCalledWith(1, getMsg(ringtone, 6.7))
          done()
        })
        session.calling.notificationHandler(_collectNotification)
      })

      it('.promptRingtoneAsync() should return a PromptAction for async control', async done => {
        const params = { name: 'at', initial_timeout: 10, digits_max: 5, digits_terminators: '#', digits_timeout: 10 }
        const action = await call.promptRingtoneAsync(params)
        expect(action).toBeInstanceOf(PromptAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg(ringtone))
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
        method: 'calling.receive_fax',
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
        method: 'calling.send_fax',
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
      const _notificationFaxCED = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"fax","params":{"event":"CED"}}}}')
      // const _notificationFaxError = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"fax","params":{"event":"error"}}}}')
      const _notificationFaxFinished = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"fax","params":{"event":"finished"}}}}')

      const _notificationMachineHuman = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"machine","params":{"event":"HUMAN"}}}}')
      const _notificationMachineMachine = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"machine","params":{"event":"MACHINE"}}}}')
      const _notificationMachineUnknown = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"machine","params":{"event":"UNKNOWN"}}}}')
      const _notificationMachineReady = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"machine","params":{"event":"READY"}}}}')
      const _notificationMachineNotReady = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"machine","params":{"event":"NOT_READY"}}}}')
      // const _notificationMachineError = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"machine","params":{"event":"error"}}}}')
      const _notificationMachineFinished = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"machine","params":{"event":"finished"}}}}')

      const _notificationDigitDTMF = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"digit","params":{"event":"1#"}}}}')
      const _notificationDigitError = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"digit","params":{"event":"error"}}}}')
      const _notificationDigitFinished = JSON.parse('{"event_type":"calling.call.detect","params":{"control_id":"mocked-uuid","call_id":"call-id","node_id":"node-id","detect":{"type":"digit","params":{"event":"finished"}}}}')

      const getMsg = (type: string, params: any = {}, timeout = 30) => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'calling.detect',
        params: { node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid', detect: { type, params }, timeout }
      })

      it('.detect() with type "fax" should resolve successfully on the first valid event', done => {
        call.detect({ type: 'fax', timeout: 30 }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(true)
          expect(result.type).toBe('fax')
          expect(result.result).toBe('CED')
          expect(Connection.mockSend).nthCalledWith(1, getMsg('fax'))
          done()
        })
        session.calling.notificationHandler(_notificationFaxCED)
      })

      it('.detect() with type "machine" should resolve successfully on the first valid event', done => {
        call.detect({ type: 'machine', timeout: 30 }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(true)
          expect(result.type).toBe('machine')
          expect(result.result).toBe('MACHINE')
          expect(Connection.mockSend).nthCalledWith(1, getMsg('machine'))
          done()
        })
        session.calling.notificationHandler(_notificationMachineMachine)
      })

      it('.detect() with type "digit" should resolve successfully on the first valid event', done => {
        call.detect({ type: 'digit', timeout: 30 }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(true)
          expect(result.type).toBe('digit')
          expect(result.result).toBe('1#')
          expect(Connection.mockSend).nthCalledWith(1, getMsg('digit'))
          done()
        })
        session.calling.notificationHandler(_notificationDigitDTMF)
      })

      it('.detect() should fail if detector reach timeout', done => {
        call.detect({ type: 'digit', timeout: 30 }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(false)
          expect(result.type).toBe('digit')
          expect(result.result).toBeUndefined()
          expect(Connection.mockSend).nthCalledWith(1, getMsg('digit'))
          done()
        })
        session.calling.notificationHandler(_notificationDigitFinished)
      })

      it('.detect() should fail if detector returns an error', done => {
        call.detect({ type: 'digit', timeout: 30 }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(false)
          expect(result.type).toBe('digit')
          expect(result.result).toBeUndefined()
          expect(Connection.mockSend).nthCalledWith(1, getMsg('digit'))
          done()
        })
        session.calling.notificationHandler(_notificationDigitError)
      })

      it('.detectAsync() should return a DetectAction for async control', async done => {
        const action = await call.detectAsync({ type: 'fax', timeout: 30 })
        expect(action).toBeInstanceOf(DetectAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('fax'))
        session.calling.notificationHandler(_notificationFaxCED)
        expect(action.completed).toBe(false)
        session.calling.notificationHandler(_notificationFaxFinished)
        expect(action.completed).toBe(true)
        expect(action.result.result).toBe('CED')
        done()
      })

      it('.detectAnsweringMachine() without wait_for_beep should resolve on the first valid event', done => {
        call.detectAnsweringMachine({ initial_timeout: 5, timeout: 30 }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(true)
          expect(result.type).toBe('machine')
          expect(result.result).toBe('UNKNOWN')
          expect(Connection.mockSend).nthCalledWith(1, getMsg('machine', { initial_timeout: 5 }))
          done()
        })
        session.calling.notificationHandler(_notificationMachineUnknown)
      })

      it('.detectAnsweringMachine() with wait_for_beep should wait until READY in case of MACHINE', done => {
        call.detectAnsweringMachine({ initial_timeout: 5, timeout: 30, wait_for_beep: true }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(true)
          expect(result.type).toBe('machine')
          expect(result.result).toBe('MACHINE')
          expect(Connection.mockSend).nthCalledWith(1, getMsg('machine', { initial_timeout: 5 }))
          done()
        })
        session.calling.notificationHandler(_notificationMachineMachine)
        session.calling.notificationHandler(_notificationMachineNotReady)
        session.calling.notificationHandler(_notificationMachineReady)
        session.calling.notificationHandler(_notificationMachineNotReady) // This will be ignored by Detect component
      })

      it('.detectAnsweringMachine() with wait_for_beep should resolve if the first event is not MACHINE', done => {
        call.detectAnsweringMachine({ initial_timeout: 5, timeout: 30, wait_for_beep: true }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(true)
          expect(result.type).toBe('machine')
          expect(result.result).toBe('HUMAN')
          expect(Connection.mockSend).nthCalledWith(1, getMsg('machine', { initial_timeout: 5 }))
          done()
        })
        session.calling.notificationHandler(_notificationMachineHuman)
      })

      it('.detectAnsweringMachine() should fail if detector reach timeout', done => {
        call.detectAnsweringMachine({ initial_timeout: 5, timeout: 30 }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(false)
          expect(result.type).toBe('machine')
          expect(result.result).toBeUndefined()
          expect(Connection.mockSend).nthCalledWith(1, getMsg('machine', { initial_timeout: 5 }))
          done()
        })
        session.calling.notificationHandler(_notificationMachineFinished)
      })

      it('.detectAnsweringMachineAsync() should return a DetectAction for async control', async done => {
        const action = await call.detectAnsweringMachineAsync({ initial_timeout: 5, timeout: 30 })
        expect(action).toBeInstanceOf(DetectAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('machine', { initial_timeout: 5 }))
        session.calling.notificationHandler(_notificationMachineMachine)
        session.calling.notificationHandler(_notificationMachineNotReady)
        session.calling.notificationHandler(_notificationMachineReady)
        session.calling.notificationHandler(_notificationMachineUnknown)
        session.calling.notificationHandler(_notificationMachineHuman)
        expect(action.completed).toBe(false)
        session.calling.notificationHandler(_notificationMachineFinished)
        expect(action.completed).toBe(true)
        done()
      })

      it('.detectMachine() should resolve successfully on the first MACHINE event', done => {
        call.detectMachine({ initial_timeout: 5, timeout: 30 }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(true)
          expect(result.type).toBe('machine')
          expect(result.result).toBe('MACHINE')
          expect(Connection.mockSend).nthCalledWith(1, getMsg('machine', { initial_timeout: 5 }))
          done()
        })
        session.calling.notificationHandler(_notificationMachineMachine)
      })

      it('.detectMachine() should fail if the first event is not MACHINE', done => {
        call.detectMachine({ initial_timeout: 5, timeout: 30 }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(false)
          expect(result.type).toBe('machine')
          expect(result.result).toBe('HUMAN')
          expect(Connection.mockSend).nthCalledWith(1, getMsg('machine', { initial_timeout: 5 }))
          done()
        })
        session.calling.notificationHandler(_notificationMachineHuman)
      })

      it('.detectMachineAsync() should return a DetectAction for async control', async done => {
        const action = await call.detectMachineAsync({ initial_timeout: 5, timeout: 30 })
        expect(action).toBeInstanceOf(DetectAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('machine', { initial_timeout: 5 }))
        session.calling.notificationHandler(_notificationMachineMachine)
        session.calling.notificationHandler(_notificationMachineNotReady)
        session.calling.notificationHandler(_notificationMachineReady)
        expect(action.completed).toBe(false)
        session.calling.notificationHandler(_notificationMachineFinished)
        expect(action.completed).toBe(true)
        done()
      })

      it('.detectHuman() should resolve successfully on the first HUMAN event', done => {
        call.detectHuman({ initial_timeout: 5, timeout: 30 }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(true)
          expect(result.type).toBe('machine')
          expect(result.result).toBe('HUMAN')
          expect(Connection.mockSend).nthCalledWith(1, getMsg('machine', { initial_timeout: 5 }))
          done()
        })
        session.calling.notificationHandler(_notificationMachineHuman)
      })

      it('.detectHuman() should fail if the first event is not HUMAN', done => {
        call.detectHuman({ initial_timeout: 5, timeout: 30 }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(false)
          expect(result.type).toBe('machine')
          expect(result.result).toBe('UNKNOWN')
          expect(Connection.mockSend).nthCalledWith(1, getMsg('machine', { initial_timeout: 5 }))
          done()
        })
        session.calling.notificationHandler(_notificationMachineUnknown)
      })

      it('.detectHumanAsync() should return a DetectAction for async control', async done => {
        const action = await call.detectHumanAsync({ timeout: 30 })
        expect(action).toBeInstanceOf(DetectAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('machine', {}))
        session.calling.notificationHandler(_notificationMachineUnknown)
        session.calling.notificationHandler(_notificationMachineHuman)
        expect(action.completed).toBe(false)
        session.calling.notificationHandler(_notificationMachineFinished)
        expect(action.completed).toBe(true)
        expect(action.result.result).toEqual('UNKNOWN,HUMAN')
        done()
      })

      it('.detectFax() should resolve successfully on the first CED|CNG event', done => {
        call.detectFax({ timeout: 30 }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(true)
          expect(result.type).toBe('fax')
          expect(result.result).toBe('CED')
          expect(Connection.mockSend).nthCalledWith(1, getMsg('fax'))
          done()
        })
        session.calling.notificationHandler(_notificationFaxCED)
      })

      it('.detectFaxAsync() should return a DetectAction for async control', async done => {
        const action = await call.detectFaxAsync({ tone: 'CED', timeout: 30 })
        expect(action).toBeInstanceOf(DetectAction)
        session.calling.notificationHandler(_notificationFaxCED)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('fax', { tone: 'CED' }))
        session.calling.notificationHandler(_notificationFaxFinished)
        expect(action.completed).toBe(true)
        done()
      })

      it('.detectDigit() should resolve successfully on the first DTMF event', done => {
        call.detectDigit({ timeout: 30 }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(true)
          expect(result.type).toBe('digit')
          expect(result.result).toBe('1#')
          expect(Connection.mockSend).nthCalledWith(1, getMsg('digit'))
          done()
        })
        session.calling.notificationHandler(_notificationDigitDTMF)
      })

      it('.detectDigitAsync() should return a DetectAction for async control', async done => {
        const action = await call.detectDigitAsync({ digits: '12', timeout: 30 })
        expect(action).toBeInstanceOf(DetectAction)
        session.calling.notificationHandler(_notificationDigitDTMF)
        session.calling.notificationHandler(_notificationDigitDTMF)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('digit', { digits: '12' }))
        session.calling.notificationHandler(_notificationDigitFinished)
        expect(action.completed).toBe(true)
        done()
      })

    })

    describe('tap methods', () => {

      beforeEach(() => {
        Connection.mockResponse() // Consume mock request because TAP has a different resposnse
        const response = JSON.parse('{"id":"uuid","jsonrpc":"2.0","result":{"result":{"code":"200","message":"message","control_id":"control-id"}}}')
        response.result.result.source_device = sourceService
        Connection.mockResponse.mockReturnValueOnce(response)
      })

      const sourceService: IRelayCallingTapDevice = { type: 'rtp', params: { addr: '10.10.10.10', port: 3000, codec: 'PCMU', rate: 8000 } }
      const tap: ICallingTapTap = { type: 'audio', direction: 'listen' }
      const device: ICallingTapDevice = { type: 'rtp', addr: '127.0.0.1', port: 1234 }
      const getMsg = () => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'calling.tap',
        params: {
          node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid', tap: { type: 'audio', params: { direction: 'listen' } }, device: { type: 'rtp', params: { addr: '127.0.0.1', port: 1234 } }
        }
      })

      it('.tap() should wait until the tapping ends', done => {
        call.tap(tap, device).then(result => {
          expect(result).toBeInstanceOf(TapResult)
          expect(result.successful).toBe(true)
          expect(result.sourceDevice).toEqual(sourceService)
          expect(result.destinationDevice).toEqual({ type: 'rtp', params: { addr: '127.0.0.1', port: '1234', codec: 'PCMU', ptime: '20' } })
          expect(Connection.mockSend).nthCalledWith(1, getMsg())
          done()
        })
        session.calling.notificationHandler(_tapNotificationFinished)
      })

      it('.tap() should work with flattened params', done => {
        const params: ICallingTapFlat = {
          audio_direction: 'listen',
          target_type: 'rtp',
          target_addr: '127.0.0.1',
          target_port: 1234
        }
        call.tap(params, {}).then(result => {
          expect(result).toBeInstanceOf(TapResult)
          expect(result.successful).toBe(true)
          expect(result.sourceDevice).toEqual(sourceService)
          expect(result.destinationDevice).toEqual({ type: 'rtp', params: { addr: '127.0.0.1', port: '1234', codec: 'PCMU', ptime: '20' } })
          expect(Connection.mockSend).nthCalledWith(1, getMsg())
          done()
        })
        session.calling.notificationHandler(_tapNotificationFinished)
      })

      it('.tapAsync() should return a TapAction for async control', async done => {
        const action = await call.tapAsync(tap, device)
        expect(action).toBeInstanceOf(TapAction)
        expect(action.completed).toBe(false)
        expect(action.result).toBeInstanceOf(TapResult)
        expect(Connection.mockSend).nthCalledWith(1, getMsg())
        session.calling.notificationHandler(_tapNotificationFinished)
        expect(action.completed).toBe(true)
        done()
      })

    })

    describe('sendDigits methods', () => {
      const getMsg = () => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'calling.send_digits',
        params: { node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid', digits: '1234' }
      })

      it('.sendDigits() should wait until finished arrived', done => {
        call.sendDigits('1234').then(result => {
          expect(result).toBeInstanceOf(SendDigitsResult)
          expect(result.successful).toBe(true)
          expect(Connection.mockSend).nthCalledWith(1, getMsg())
          done()
        })
        session.calling.notificationHandler(_sendDigitsNotificationFinished)
      })

      it('.sendDigitsAsync() should return a SendDigitsAction', async done => {
        const action = await call.sendDigitsAsync('1234')
        expect(action).toBeInstanceOf(SendDigitsAction)
        expect(action.completed).toBe(false)
        expect(Connection.mockSend).nthCalledWith(1, getMsg())
        session.calling.notificationHandler(_sendDigitsNotificationFinished)
        expect(action.completed).toBe(true)
        expect(action.result).toBeInstanceOf(SendDigitsResult)
        done()
      })

    })

    describe('disconnect method', () => {
      const getMsg = () => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'calling.disconnect',
        params: { node_id: call.nodeId, call_id: call.id }
      })

      beforeEach(() => {
        session.calling.notificationHandler(_connectNotificationPeerCreated)
        session.calling.notificationHandler(_connectNotification)
      })

      it('.disconnect() should wait until call has been disconnected', done => {
        expect(call.peer.id).toEqual('peer-call-id')
        call.disconnect().then(result => {
          expect(result).toBeInstanceOf(DisconnectResult)
          expect(result.successful).toBe(true)
          expect(call.peer).toBeUndefined()
          expect(Connection.mockSend).nthCalledWith(1, getMsg())
          done()
        })
        session.calling.notificationHandler(_connectNotificationDisconnected)
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
        method: 'calling.dial',
        params: { tag: 'mocked-uuid', devices: targets }
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
        method: 'calling.answer',
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
        method: 'calling.end',
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
        method: 'calling.record',
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
        expect(action.url).toBeUndefined()
        expect(action.completed).toBe(true)
        expect(action.result).toBeInstanceOf(RecordResult)
        expect(Connection.mockSend).nthCalledWith(1, getMsg())
        done()
      })

    })

    describe('connect methods', () => {
      const _tmpDevices = [
        { type: CallType.Phone, to: '999', from: '231', timeout: 10 },
        { type: CallType.Phone, to: '888', from: '234', timeout: 20 }
      ]
      const getMsg = (serial: boolean) => {
        let devices = []
        if (serial) {
          devices = [
            [{ type: CallType.Phone, params: { to_number: '999', from_number: '231', timeout: 10 } }],
            [{ type: CallType.Phone, params: { to_number: '888', from_number: '234', timeout: 20 } }]
          ]
        } else {
          devices = [
            [
              { type: CallType.Phone, params: { to_number: '999', from_number: '231', timeout: 10 } },
              { type: CallType.Phone, params: { to_number: '888', from_number: '234', timeout: 20 } }
            ]
          ]
        }
        return new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'calling.connect',
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
        method: 'calling.play',
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
        method: 'calling.play_and_collect',
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
        method: 'calling.receive_fax',
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
        method: 'calling.send_fax',
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
      const getMsg = (type: string, params: any = {}, timeout = 30) => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'calling.detect',
        params: { node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid', detect: { type, params }, timeout }
      })

      it('.detect() should resolve the Promise with no-success response', done => {
        call.detect({ type: 'fax', timeout: 30 }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(false)
          expect(result.type).toBeUndefined()
          expect(result.result).toBeUndefined()
          expect(Connection.mockSend).nthCalledWith(1, getMsg('fax'))
          done()
        })
      })

      it('.detectAsync() should return a DetectAction for async control', async done => {
        const action = await call.detectAsync({ type: 'fax', timeout: 30 })
        expect(action).toBeInstanceOf(DetectAction)
        expect(action.completed).toBe(true)
        expect(action.result).toBeInstanceOf(DetectResult)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('fax'))
        done()
      })

      it('.detectMachine() should resolve the Promise with no-success response', done => {
        call.detectMachine({ timeout: 30 }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(false)
          expect(result.type).toBeUndefined()
          expect(result.result).toBeUndefined()
          expect(Connection.mockSend).nthCalledWith(1, getMsg('machine'))
          done()
        })
      })

      it('.detectMachineAsync() should return a DetectAction for async control', async done => {
        const action = await call.detectMachineAsync({ timeout: 30 })
        expect(action).toBeInstanceOf(DetectAction)
        expect(action.completed).toBe(true)
        expect(action.result).toBeInstanceOf(DetectResult)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('machine'))
        done()
      })

      it('.detectFax() should resolve the Promise with no-success response', done => {
        call.detectFax({ timeout: 30 }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(false)
          expect(result.type).toBeUndefined()
          expect(result.result).toBeUndefined()
          expect(Connection.mockSend).nthCalledWith(1, getMsg('fax'))
          done()
        })
      })

      it('.detectFaxAsync() should return a DetectAction for async control', async done => {
        const action = await call.detectFaxAsync({ timeout: 30 })
        expect(action).toBeInstanceOf(DetectAction)
        expect(action.completed).toBe(true)
        expect(action.result).toBeInstanceOf(DetectResult)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('fax'))
        done()
      })

      it('.detectDigit() should resolve the Promise with no-success response', done => {
        call.detectDigit({ timeout: 30 }).then(result => {
          expect(result).toBeInstanceOf(DetectResult)
          expect(result.successful).toBe(false)
          expect(result.type).toBeUndefined()
          expect(result.result).toBeUndefined()
          expect(Connection.mockSend).nthCalledWith(1, getMsg('digit'))
          done()
        })
      })

      it('.detectDigitAsync() should return a DetectAction for async control', async done => {
        const action = await call.detectDigitAsync({ timeout: 30 })
        expect(action).toBeInstanceOf(DetectAction)
        expect(action.completed).toBe(true)
        expect(action.result).toBeInstanceOf(DetectResult)
        expect(Connection.mockSend).nthCalledWith(1, getMsg('digit'))
        done()
      })

    })

    describe('tap methods', () => {
      const tap: ICallingTapTap = { type: 'audio', direction: 'listen' }
      const device: ICallingTapDevice = { type: 'rtp', addr: '127.0.0.1', port: 1234 }
      const getMsg = () => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'calling.tap',
        params: {
          node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid', tap: { type: 'audio', params: { direction: 'listen' } }, device: { type: 'rtp', params: { addr: '127.0.0.1', port: 1234 } }
        }
      })


      it('.tap() should wait until the tapping ends/fails', done => {
        call.tap(tap, device).then(result => {
          expect(result).toBeInstanceOf(TapResult)
          expect(result.successful).toBe(false)
          expect(result.sourceDevice).toBe(null)
          expect(Connection.mockSend).nthCalledWith(1, getMsg())
          done()
        })
      })

      it('.tapAsync() should return a TapAction for async control', async done => {
        const action = await call.tapAsync(tap, device)
        expect(action).toBeInstanceOf(TapAction)
        expect(action.completed).toBe(true)
        expect(action.result).toBeInstanceOf(TapResult)
        expect(Connection.mockSend).nthCalledWith(1, getMsg())
        done()
      })

    })

    describe('sendDigits methods', () => {
      const getMsg = () => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'calling.send_digits',
        params: { node_id: call.nodeId, call_id: call.id, control_id: 'mocked-uuid', digits: '1234' }
      })

      it('.sendDigits() should wait until finished arrived', done => {
        call.sendDigits('1234').then(result => {
          expect(result).toBeInstanceOf(SendDigitsResult)
          expect(result.successful).toBe(false)
          expect(Connection.mockSend).nthCalledWith(1, getMsg())
          done()
        })
      })

      it('.sendDigitsAsync() should return a SendDigitsAction', async done => {
        const action = await call.sendDigitsAsync('1234')
        expect(action).toBeInstanceOf(SendDigitsAction)
        expect(action.completed).toBe(true)
        expect(Connection.mockSend).nthCalledWith(1, getMsg())
        expect(action.result).toBeInstanceOf(SendDigitsResult)
        done()
      })

    })

    describe('disconnect method', () => {
      const getMsg = () => new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'calling.disconnect',
        params: { node_id: call.nodeId, call_id: call.id }
      })

      beforeEach(() => {
        const _connectNotification = JSON.parse(`{"event_type":"calling.call.connect","params":{"connect_state":"connected","peer":{"call_id":"peer-call-id","node_id":"peer-node-id","device":{"type":"phone","params":{"from_number":"+1234","to_number":"+15678"}}},"call_id":"call-id","node_id":"node-id"}}`)
        const _connectNotificationPeerCreated = JSON.parse('{"event_type":"calling.call.state","params":{"call_state":"created","direction":"outbound","device":{"type":"phone","params":{"from_number":"+1234","to_number":"15678"}},"peer":{"call_id":"call-id","node_id":"node-id"},"call_id":"peer-call-id","node_id":"peer-node-id"}}')
        session.calling.notificationHandler(_connectNotificationPeerCreated)
        session.calling.notificationHandler(_connectNotification)
      })

      it('.disconnect() should wait until call has been disconnected', done => {
        expect(call.peer.id).toEqual('peer-call-id')
        call.disconnect().then(result => {
          expect(result).toBeInstanceOf(DisconnectResult)
          expect(result.successful).toBe(false)
          expect(call.peer).toBeInstanceOf(Call)
          expect(Connection.mockSend).nthCalledWith(1, getMsg())
          done()
        })
      })

    })
  })
})
