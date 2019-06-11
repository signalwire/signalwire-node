import RelayClient from '../../src/relay'
import { ICallDevice } from '../../../common/src/util/interfaces'
import Call from '../../../common/src/relay/calling/Call'
import { CallState, CallNotification } from '../../../common/src/util/constants/relay'
import { isQueued } from '../../../common/src/services/Handler'
import { Execute } from '../../../common/src/messages/Blade'
import * as Actions from '../../../common/src/relay/calling/Actions'
const Connection = require('../../../common/src/services/Connection')
jest.mock('../../../common/src/services/Connection')

describe('Call', () => {
  let session: RelayClient = null

  beforeAll(async done => {
    session = new RelayClient({ host: 'example.signalwire.com', project: 'project', token: 'token' })
    await session.connect()

    Connection.mockResponse
      .mockReturnValueOnce(JSON.parse('{"id":"c04d725a-c8bc-4b9e-bf1e-9c05150797cc","jsonrpc":"2.0","result":{"requester_nodeid":"05b1114c-XXXX-YYYY-ZZZZ-feaa30afad6c","responder_nodeid":"9811eb32-XXXX-YYYY-ZZZZ-ab56fa3b83c9","result":{"protocol":"signalwire_service_random_uuid"}}}'))
      .mockReturnValueOnce(JSON.parse('{"id":"24f9b545-8bed-49e1-8214-5dbadb545f7d","jsonrpc":"2.0","result":{"command":"add","failed_channels":[],"protocol":"signalwire_service_random_uuid","subscribe_channels":["notifications"]}}'))
    session.calling.addCall = jest.fn()
    done()
  })

  let call: Call = null
  beforeEach(() => {
    Connection.mockSend.mockClear()
    const device: ICallDevice = { type: 'phone', params: { from_number: '2345', to_number: '6789', timeout: 30 } }
    // @ts-ignore
    call = new Call(session.calling, { device })
  })

  it('should create the Call object with no id and nodeId', () => {
    expect(call.state).toEqual('none')
    expect(call.id).toBeUndefined()
    expect(call.nodeId).toBeUndefined()
  })

  it('should add the call to the cache array', () => {
    expect(session.calling.addCall).toHaveBeenCalledWith(call)
  })

  it('should not have peers', () => {
    expect(call.peer).toBeUndefined()
  })

  it('should throw with .hangup()', async () => {
    await expect(call.hangup()).rejects.toThrowError('Call has not started')
  })

  it('should throw with .answer()', async () => {
    await expect(call.answer()).rejects.toThrowError('Call has not started')
  })

  it('should throw with .connect()', async () => {
    await expect(call.connect({ type: 'phone', to: '234599' })).rejects.toThrowError('Call has not started')
  })

  it('should throw with .record()', async () => {
    await expect(call.record({ audio: { format: 'mp3' } })).rejects.toThrowError('Call has not started')
  })

  it('should throw with .playMedia()', async () => {
    const silence = { type: 'silence', params: { duration: 20 } }
    await expect(call.playMedia(silence)).rejects.toThrowError('Call has not started')
  })

  describe('.on()', () => {
    it('should be chainable', () => {
      expect(call.on('created', jest.fn())).toBe(call)
    })

    it('should save callback in the stack if the call has not started yet', () => {
      const mockFn = jest.fn()
      call.on('created', mockFn)
      call.on('answered', mockFn)
      call._stateChange({ call_state: 'created' })
      call._stateChange({ call_state: 'answered' })
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    describe('with the call ready', () => {
      beforeEach(() => {
        call.id = 'testing-on-method'
        // @ts-ignore
        call._state = CallState.answered
      })

      afterEach(() => {
        call.id = undefined
        // @ts-ignore
        call._state = CallState.created
      })

      it('should fire the callback if the event has already passed', () => {
        const mockFn = jest.fn()
        call.on('created', mockFn)
        expect(isQueued(call.id)).toEqual(false)
        expect(mockFn).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('.off()', () => {
    it('should be chainable', () => {
      expect(call.off('created', jest.fn())).toBe(call)
    })

    it('should remove callback from the stack if the call has not started yet', () => {
      const mockFn = jest.fn()
      call.on('created', mockFn)
      call.off('created', mockFn)
      call._stateChange({ call_state: 'created' })
      expect(mockFn).not.toHaveBeenCalled()
    })

    describe('with ', () => {
      it('should deRegister the callback if the call has already started', () => {
        call.id = 'testing-off-method'

        call.on('created', jest.fn())
        call.off('created')
        expect(isQueued(call.id)).toEqual(false)

        call.id = undefined
      })
    })
  })

  describe('when call is ready', () => {
    const _stateNotificationAnswered = JSON.parse(`{"call_state":"answered","call_id":"call-id","event_type":"${CallNotification.State}"}`)
    const _stateNotificationEnded = JSON.parse(`{"call_state":"ended","call_id":"call-id","event_type":"${CallNotification.State}"}`)
    const _playNotification = JSON.parse(`{"state":"finished","call_id":"call-id","control_id":"mocked-uuid","event_type":"${CallNotification.Play}"}`)
    const _collectNotification = JSON.parse(`{"control_id":"mocked-uuid","call_id":"call-id","event_type":"${CallNotification.Collect}","result":{"type":"digit","params":{"digits":"12345","terminator":"#"}}}`)
    const _recordNotification = JSON.parse(`{"state":"finished","call_id":"call-id","control_id":"mocked-uuid","event_type":"${CallNotification.Record}","url":"record-url","record":{"audio":{"type":"digit","params":{"digits":"12345","terminator":"#"}}}}`)
    const _connectNotification = JSON.parse(`{"connect_state":"connected","call_id":"call-id","event_type":"${CallNotification.Connect}"}`)
    const _detectNotification = JSON.parse(`{"call_id":"call-id","control_id":"mocked-uuid","event_type":"${CallNotification.Detect}","detect":{"type":"fax","params":{"event":"finished"}}}`)

    beforeEach(() => {
      call.id = 'call-id'
      call.nodeId = 'node-id'
      Connection.mockResponse.mockReturnValueOnce(JSON.parse('{"id":"c04d725a-c8bc-4b9e-bf1e-9c05150797cc","jsonrpc":"2.0","result":{"requester_nodeid":"05b1114c-XXXX-YYYY-ZZZZ-feaa30afad6c","responder_nodeid":"9811eb32-XXXX-YYYY-ZZZZ-ab56fa3b83c9","result":{"code":"200","message":"message","control_id":"control-id"}}}'))
    })

    it('.answer() should wait answered notification', done => {
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.answer',
        params: {
          node_id: call.nodeId,
          call_id: call.id
        }
      })
      call.answer().then(call => {
        expect(call.state).toEqual('answered')
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })
      call._stateChange(_stateNotificationAnswered)
    })

    it('.hangup() should wait ended notification', done => {
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.end',
        params: {
          node_id: call.nodeId,
          call_id: call.id,
          reason: 'hangup'
        }
      })
      call.hangup().then(call => {
        expect(call.state).toEqual('ended')
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })
      call._stateChange(_stateNotificationEnded)
    })

    describe('record methods', () => {
      it('.record() should execute the right message', async done => {
        const record = { audio: { format: 'mp3', beep: true } }
        const action = await call.record(record)
        const msg = new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'call.record',
          params: {
            node_id: call.nodeId,
            call_id: call.id,
            control_id: 'mocked-uuid',
            record
          }
        })
        expect(action).toBeInstanceOf(Actions.RecordAction)
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })

      it('.recordSync() should execute the right message', done => {
        const record = { audio: { format: 'mp3', beep: true } }
        const msg = new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'call.record',
          params: {
            node_id: call.nodeId,
            call_id: call.id,
            control_id: 'mocked-uuid',
            record
          }
        })
        call.recordSync(record).then(result => {
          expect(result).toMatchObject(_recordNotification)
          expect(Connection.mockSend).toHaveBeenCalledTimes(1)
          expect(Connection.mockSend).toHaveBeenCalledWith(msg)
          done()
        })
        call._recordStateChange(_recordNotification)
      })
    })

    describe('connect methods', () => {
      it('.connect() devices in series', async done => {
        const devices = [
          { type: 'phone', to: '999', from: '231', timeout: 10 },
          { type: 'phone', to: '888', from: '234', timeout: 20 }
        ]
        const action = await call.connect(...devices)
        const msg = new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'call.connect',
          params: {
            node_id: call.nodeId,
            call_id: call.id,
            devices: [
              [
                { type: 'phone', params: { to_number: '999', from_number: '231', timeout: 10 } }
              ],
              [
                { type: 'phone', params: { to_number: '888', from_number: '234', timeout: 20 } }
              ]
            ]
          }
        })
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })

      it('.connect() devices in parallel', async done => {
        const devices = [
          { type: 'phone', to: '999', from: '231', timeout: 10 },
          { type: 'phone', to: '888', from: '234', timeout: 20 }
        ]
        const action = await call.connect(devices)
        const msg = new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'call.connect',
          params: {
            node_id: call.nodeId,
            call_id: call.id,
            devices: [
              [
                { type: 'phone', params: { to_number: '999', from_number: '231', timeout: 10 } },
                { type: 'phone', params: { to_number: '888', from_number: '234', timeout: 20 } }
              ]
            ]
          }
        })
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })

      it('.connect() devices in series and parallel', async done => {
        const action = await call.connect(
          { type: 'phone', to: '999', from: '231', timeout: 10 },
          { type: 'phone', to: '888', from: '234', timeout: 20 },
          [
            { type: 'phone', to: '777', from: '231', timeout: 10 },
            { type: 'phone', to: '555', from: '234', timeout: 20 }
          ]
        )
        const msg = new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'call.connect',
          params: {
            node_id: call.nodeId,
            call_id: call.id,
            devices: [
              [
                { type: 'phone', params: { to_number: '999', from_number: '231', timeout: 10 } },
              ],
              [
                { type: 'phone', params: { to_number: '888', from_number: '234', timeout: 20 } }
              ],
              [
                { type: 'phone', params: { to_number: '777', from_number: '231', timeout: 10 } },
                { type: 'phone', params: { to_number: '555', from_number: '234', timeout: 20 } }
              ]
            ]
          }
        })
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })

      it('.connectSync() devices in series and parallel', done => {
        const msg = new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'call.connect',
          params: {
            node_id: call.nodeId,
            call_id: call.id,
            devices: [
              [
                { type: 'phone', params: { to_number: '999', from_number: '231', timeout: 10 } },
              ],
              [
                { type: 'phone', params: { to_number: '888', from_number: '234', timeout: 20 } }
              ],
              [
                { type: 'phone', params: { to_number: '777', from_number: '231', timeout: 10 } },
                { type: 'phone', params: { to_number: '555', from_number: '234', timeout: 20 } }
              ]
            ]
          }
        })

        call.connectSync(
          { type: 'phone', to: '999', from: '231', timeout: 10 },
          { type: 'phone', to: '888', from: '234', timeout: 20 },
          [
            { type: 'phone', to: '777', from: '231', timeout: 10 },
            { type: 'phone', to: '555', from: '234', timeout: 20 }
          ]
        ).then(call => {
          expect(call).toBeInstanceOf(Call)
          expect(call.connectState).toEqual('connected')
          expect(Connection.mockSend).toHaveBeenCalledTimes(1)
          expect(Connection.mockSend).toHaveBeenCalledWith(msg)
          done()
        })
        call._connectStateChange(_connectNotification)
      })
    })

    describe('play methods', () => {
      it('.playAudio() should execute the correct message', async done => {
        const action = await call.playAudio('audio.mp3')
        const msg = new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'call.play',
          params: {
            node_id: call.nodeId,
            call_id: call.id,
            control_id: 'mocked-uuid',
            play: [{ type: 'audio', params: { url: 'audio.mp3' } }]
          }
        })
        expect(action).toBeInstanceOf(Actions.PlayAudioAction)
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })

      it('.playSilence() should execute the correct message', async done => {
        const action = await call.playSilence(5)
        const msg = new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'call.play',
          params: {
            node_id: call.nodeId,
            call_id: call.id,
            control_id: 'mocked-uuid',
            play: [{ type: 'silence', params: { duration: 5 } }]
          }
        })
        expect(action).toBeInstanceOf(Actions.PlaySilenceAction)
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })

      it('.playTTS() should execute the correct message', async done => {
        const action = await call.playTTS({ text: 'Hello', gender: 'male' })
        const msg = new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'call.play',
          params: {
            node_id: call.nodeId,
            call_id: call.id,
            control_id: 'mocked-uuid',
            play: [{ type: 'tts', params: { text: 'Hello', gender: 'male' } }]
          }
        })
        expect(action).toBeInstanceOf(Actions.PlayTTSAction)
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })

      it('.playMedia() should execute the correct message', async done => {
        const action = await call.playMedia({ type: 'silence', params: { duration: 5 } }, { type: 'tts', params: { text: 'Example' } })
        const msg = new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'call.play',
          params: {
            node_id: call.nodeId,
            call_id: call.id,
            control_id: 'mocked-uuid',
            play: [
              { type: 'silence', params: { duration: 5 } },
              { type: 'tts', params: { text: 'Example' } }
            ]
          }
        })
        expect(action).toBeInstanceOf(Actions.PlayMediaAction)
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })
    })

    describe('play_and_collect methods', () => {
      const collect = { initial_timeout: 10, digits: { max: 5, terminators: '#', digit_timeout: 10 } }

      it('.playAudioAndCollect() should execute the correct message', async done => {
        const action = await call.playAudioAndCollect(collect, 'audio.mp3')
        const msg = new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'call.play_and_collect',
          params: {
            node_id: call.nodeId,
            call_id: call.id,
            control_id: 'mocked-uuid',
            play: [{ type: 'audio', params: { url: 'audio.mp3' } }],
            collect
          }
        })
        expect(action).toBeInstanceOf(Actions.PlayAudioAndCollectAction)
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })

      it('.playSilenceAndCollect() should execute the correct message', async done => {
        const action = await call.playSilenceAndCollect(collect, 5)
        const msg = new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'call.play_and_collect',
          params: {
            node_id: call.nodeId,
            call_id: call.id,
            control_id: 'mocked-uuid',
            play: [{ type: 'silence', params: { duration: 5 } }],
            collect
          }
        })
        expect(action).toBeInstanceOf(Actions.PlaySilenceAndCollectAction)
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })

      it('.playTTSAndCollect() should execute the correct message', async done => {
        const action = await call.playTTSAndCollect(collect, { text: 'digit something' })
        const msg = new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'call.play_and_collect',
          params: {
            node_id: call.nodeId,
            call_id: call.id,
            control_id: 'mocked-uuid',
            play: [{ type: 'tts', params: { text: 'digit something' } }],
            collect
          }
        })
        expect(action).toBeInstanceOf(Actions.PlayTTSAndCollectAction)
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })

      it('.playMediaAndCollect() should execute the correct message', async done => {
        const action = await call.playMediaAndCollect(
          collect,
          { type: 'silence', params: { duration: 5 } },
          { type: 'tts', params: { text: 'digit something' } }
        )
        const msg = new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'call.play_and_collect',
          params: {
            node_id: call.nodeId,
            call_id: call.id,
            control_id: 'mocked-uuid',
            play: [
              { type: 'silence', params: { duration: 5 } },
              { type: 'tts', params: { text: 'digit something' } }
            ],
            collect
          }
        })
        expect(action).toBeInstanceOf(Actions.PlayMediaAndCollectAction)
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })
    })

    describe('detect methods', () => {
      it('.detect() should execute the right message', async done => {
        const action = await call.detect('fax')
        const msg = new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'call.detect',
          params: {
            node_id: call.nodeId,
            call_id: call.id,
            control_id: 'mocked-uuid',
            detect: { type: 'fax', params: {} }
          }
        })
        expect(action).toBeInstanceOf(Actions.DetectAction)
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
        done()
      })

      it('.detectSync() should execute the right message', done => {
        const msg = new Execute({
          protocol: 'signalwire_service_random_uuid',
          method: 'call.detect',
          params: {
            node_id: call.nodeId,
            call_id: call.id,
            control_id: 'mocked-uuid',
            detect: { type: 'fax', params: {} }
          }
        })
        call.detectSync('fax').then(result => {
          expect(result.type).toEqual('fax')
          expect(result.params.event).toEqual('finished')
          expect(Connection.mockSend).toHaveBeenCalledTimes(1)
          expect(Connection.mockSend).toHaveBeenCalledWith(msg)
          done()
        })
        call._detectStateChange(_detectNotification)
      })
    })
  })
})
