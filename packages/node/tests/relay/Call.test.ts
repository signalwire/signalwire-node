import SignalWire from '../../src/SignalWire'
import { ICallDevice } from '../../../common/src/util/interfaces'
import Call from '../../src/relay/calling/Call'
import { CallState } from '../../../common/src/util/constants/relay'
import { monitorCallbackQueue, trigger } from '../../../common/src/services/Handler'
// import Calling from '../../src/relay/calling/Calling'
const Connection = require('../../../common/src/services/Connection')
jest.mock('../../../common/src/services/Connection')

describe('Call', () => {
  const mockSetupResponses = () => {
    Connection.mockResponse
      .mockImplementationOnce(() => JSON.parse('{"id":"c04d725a-c8bc-4b9e-bf1e-9c05150797cc","jsonrpc":"2.0","result":{"requester_nodeid":"05b1114c-XXXX-YYYY-ZZZZ-feaa30afad6c","responder_nodeid":"9811eb32-XXXX-YYYY-ZZZZ-ab56fa3b83c9","result":{"protocol":"signalwire_service_random_uuid"}}}'))
      .mockImplementationOnce(() => JSON.parse('{"id":"24f9b545-8bed-49e1-8214-5dbadb545f7d","jsonrpc":"2.0","result":{"command":"add","failed_channels":[],"protocol":"signalwire_service_random_uuid","subscribe_channels":["notifications"]}}'))
  }

  let session: SignalWire = null

  beforeAll(async done => {
    session = new SignalWire({ host: 'example.signalwire.com', project: 'project', token: 'token' })
    await session.connect()
    done()
  })

  // beforeEach(() => { mockSetupResponses() })

  afterAll(() => {
    session.disconnect()
    session = null
  })

  describe('creating outbound calls', () => {
    let call: Call = null
    beforeEach(() => {
      // mockSetupResponses()
      session.calling.addCall = jest.fn()
      const device: ICallDevice = { type: 'phone', params: { from_number: '2345', to_number: '6789', timeout: 30 } }
      call = new Call(session.calling, { device })
    })

    it('should create the Call object and do nothing else', () => {
      expect(call.state).toEqual('none')
      expect(call.id).toBeUndefined()
      expect(session.calling.addCall).not.toHaveBeenCalled()
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

    it('should throw with .join()', async () => {
      await expect(call.join(call)).rejects.toThrowError('Call has not started')
    })

    it('should throw with .leave()', async () => {
      await expect(call.leave(call)).rejects.toThrowError('Call has not started')
    })

    it('should throw with .connect()', async () => {
      await expect(call.connect('234599')).rejects.toThrowError('Call has not started')
    })

    it('should throw with .playMedia()', async () => {
      const silence = { type: 'silence', params: { duration: 20 } }
      await expect(call.playMedia(silence)).rejects.toThrowError('Call has not started')
    })

    it('should throw with .stopMedia()', async () => {
      await expect(call.stopMedia()).rejects.toThrowError('Call has not started')
    })

    describe('.on()', () => {
      it('should be chainable', () => {
        expect(call.on('created', jest.fn())).toBe(call)
      })

      describe('with the call not started yet', () => {
        it('should save callback in _cbQueues object', () => {
          const mockFn = jest.fn()
          call.on('created', mockFn)
          call.on('answered', mockFn)
          // @ts-ignore
          expect(call._cbQueues['answered']).toEqual(mockFn)
          // @ts-ignore
          expect(call._cbQueues['created']).toEqual(mockFn)
        })
      })

      describe('with the call already started', () => {
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
          expect(monitorCallbackQueue()).not.toHaveProperty('testing-on-method')
          expect(mockFn).toHaveBeenCalledTimes(1)
        })

        it('should register the callback once if the event has not already passed', () => {
          const mockFn = jest.fn()
          call.on('ended', mockFn)
          const queue = monitorCallbackQueue()['testing-on-method']
          expect(queue).toHaveProperty('ended')
          expect(queue['ended']).toHaveLength(1)
        })
      })
    })

    describe('.off()', () => {
      it('should be chainable', () => {
        expect(call.off('created', jest.fn())).toBe(call)
      })

      describe('with the call not started yet', () => {
        it('should remove callback from _cbQueues object', () => {
          const mockFn = jest.fn()
          call.on('created', mockFn)

          call.off('created', mockFn)
          // @ts-ignore
          expect(call._cbQueues).not.toHaveProperty('created')
        })
      })

      describe('with the call already started', () => {
        beforeEach(() => {
          call.id = 'testing-off-method'
        })

        afterEach(() => {
          call.id = undefined
        })

        it('should deRegister the callback', () => {
          const mockFn = jest.fn()
          call.on('created', mockFn)

          call.off('created')
          expect(monitorCallbackQueue()).not.toHaveProperty('testing-off-method')
        })
      })
    })

  })

  // describe('inbound', () => {

  // })
})
