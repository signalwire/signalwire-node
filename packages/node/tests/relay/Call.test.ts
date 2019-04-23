import RelayClient from '../../src/relay'
import { ICallDevice } from '../../../common/src/util/interfaces'
import Call from '../../../common/src/relay/calling/Call'
import { CallState } from '../../../common/src/util/constants/relay'
import { isQueued } from '../../../common/src/services/Handler'
import { Execute } from '../../../common/src/messages/Blade'
const Connection = require('../../../common/src/services/Connection')
jest.mock('../../../common/src/services/Connection')

describe('Call', () => {
  // const mockSetupResponses = () => {
  //   Connection.mockResponse
  //     .mockImplementationOnce(() => JSON.parse('{"id":"c04d725a-c8bc-4b9e-bf1e-9c05150797cc","jsonrpc":"2.0","result":{"requester_nodeid":"05b1114c-XXXX-YYYY-ZZZZ-feaa30afad6c","responder_nodeid":"9811eb32-XXXX-YYYY-ZZZZ-ab56fa3b83c9","result":{"protocol":"signalwire_service_random_uuid"}}}'))
  //     .mockImplementationOnce(() => JSON.parse('{"id":"24f9b545-8bed-49e1-8214-5dbadb545f7d","jsonrpc":"2.0","result":{"command":"add","failed_channels":[],"protocol":"signalwire_service_random_uuid","subscribe_channels":["notifications"]}}'))
  // }

  let session: RelayClient = null

  beforeAll(done => {
    session = new RelayClient({ host: 'example.signalwire.com', project: 'project', token: 'token' })
    session.connect().then(done)
  })

  afterAll(() => {
    // session.disconnect()
    session = null
  })

  let call: Call = null
  beforeEach(() => {
    Connection.mockSend.mockClear()
    // mockSetupResponses()

    Connection.mockResponse
      .mockReturnValueOnce(JSON.parse('{"id":"c04d725a-c8bc-4b9e-bf1e-9c05150797cc","jsonrpc":"2.0","result":{"requester_nodeid":"05b1114c-XXXX-YYYY-ZZZZ-feaa30afad6c","responder_nodeid":"9811eb32-XXXX-YYYY-ZZZZ-ab56fa3b83c9","result":{"protocol":"signalwire_service_random_uuid"}}}'))
      .mockReturnValueOnce(JSON.parse('{"id":"24f9b545-8bed-49e1-8214-5dbadb545f7d","jsonrpc":"2.0","result":{"command":"add","failed_channels":[],"protocol":"signalwire_service_random_uuid","subscribe_channels":["notifications"]}}'))

    session.calling.addCall = jest.fn()
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

  it('should throw with .startRecord()', async () => {
    await expect(call.startRecord({ format: 'mp3' })).rejects.toThrowError('Call has not started')
  })

  it('should throw with .playMedia()', async () => {
    const silence = { type: 'silence', params: { duration: 20 } }
    await expect(call.playMedia(silence)).rejects.toThrowError('Call has not started')
  })

  it('should throw with .stopPlay()', async () => {
    await expect(call.stopPlay('control-id')).rejects.toThrowError('Call has not started')
  })

  describe('.on()', () => {
    it('should be chainable', () => {
      expect(call.on('created', jest.fn())).toBe(call)
    })

    it('should save callback in the stack if the call has not started yet', () => {
      const mockFn = jest.fn()
      call.on('created', mockFn)
      call.on('answered', mockFn)
      call.stateChange('created')
      call.stateChange('answered')
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
      call.stateChange('created')
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
    beforeEach(() => {
      call.id = 'call-id'
      call.nodeId = 'node-id'
    })

    afterAll(() => {
      call.id = undefined
      call.nodeId = undefined
    })

    it('.startRecord() should execute the right message', () => {
      const opts = { format: 'mp3', beep: true }
      call.startRecord(opts)
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.record',
        params: {
          node_id: call.nodeId,
          call_id: call.id,
          control_id: 'mocked-uuid',
          type: 'audio',
          params: opts
        }
      })
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
    })

    it('.stopRecord() should execute the right message', () => {
      call.stopRecord('control-id')
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.record.stop',
        params: {
          node_id: call.nodeId,
          call_id: call.id,
          control_id: 'control-id'
        }
      })
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
    })

    it('.playAudio() should execute the correct message', () => {
      call.playAudio('audio.mp3')
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
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
    })

    it('.playSilence() should execute the correct message', () => {
      call.playSilence(5)
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
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
    })

    it('.playTTS() should execute the correct message', () => {
      call.playTTS({ text: 'Hello', gender: 'male' })
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
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
    })

    it('.playMedia() should execute the correct message', () => {
      call.playMedia({ type: 'silence', params: { duration: 5 } }, { type: 'tts', params: { text: 'Example' } })
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
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
    })

    it('.stopPlay() should execute the correct message', () => {
      call.stopPlay('control-id')
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.play.stop',
        params: {
          node_id: call.nodeId,
          call_id: call.id,
          control_id: 'control-id'
        }
      })
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
    })

    describe('play_and_collect', () => {
      const collect = { initial_timeout: 10, digits: { max: 5, terminators: '#', digit_timeout: 10 } }

      it('.playAudioAndCollect() should execute the correct message', () => {
        call.playAudioAndCollect(collect, 'audio.mp3')
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
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
      })

      it('.playSilenceAndCollect() should execute the correct message', () => {
        call.playSilenceAndCollect(collect, 5)
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
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
      })

      it('.playTTSAndCollect() should execute the correct message', () => {
        call.playTTSAndCollect(collect, { text: 'digit something' })
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
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
      })

      it('.playAndCollect() should execute the correct message', () => {
        call.playAndCollect(
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
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        expect(Connection.mockSend).toHaveBeenCalledWith(msg)
      })
    })
  })
})
