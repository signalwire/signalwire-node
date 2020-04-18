import Call from './Call'
import { State, VertoMethod } from './constants'
import { isQueued, clearQueue } from '../services/Handler'
import { SwEvent } from '../util/constants'
const Connection = require('../../../common/src/services/Connection')

export default (instance: any) => {
  describe('WebRTC Call', () => {
    let call: Call
    const defaultParams = { destinationNumber: 'x3599', remoteCallerName: 'Js Client Test', remoteCallerNumber: '1234', callerName: 'Jest Client', callerNumber: '5678' }
    const noop = () => {}

    const expectEventsToHaveBeenQueued = (check: boolean) => {
      const events = [
        SwEvent.MediaError,
        VertoMethod.Answer,
        VertoMethod.Media,
        VertoMethod.Bye,
        VertoMethod.Display,
        VertoMethod.Attach,
        VertoMethod.Info,
        VertoMethod.Event,
      ]
      for (const event of events) {
        expect(isQueued(call.id, event)).toEqual(check)
      }
    }

    beforeEach(() => {
      clearQueue()
      call = new Call(instance, defaultParams)
    })

    describe('setting options', () => {
      it('should has state new and add this to instance.calls', () => {
        expect(call.state).toEqual('new')
        expect(instance.calls).toHaveProperty(call.id)
      })

      it('should instantiate the default listeners', () => {
        expectEventsToHaveBeenQueued(true)
      })

      it('should use the options.id as callId', () => {
        call = new Call(instance, { ...defaultParams, id: 'test-id-example' })
        expect(call.id).toEqual('test-id-example')
        expect(instance.calls).toHaveProperty('test-id-example')
      })

      it('should set a listener for the notifications', () => {
        call = new Call(instance, { ...defaultParams, onNotification: noop })
        expect(isQueued(call.id, SwEvent.Notification)).toEqual(true)
      })
    })

    describe('.setState()', () => {
      beforeEach(() => {
        call = new Call(instance, { ...defaultParams, onNotification: noop })
        expect(call.prevState).toEqual(call.state)
      })

      it('set state to Requesting', () => {
        call.setState(State.Requesting)
        expect(call.state).toEqual('requesting')
      })

      it('set state to Trying', () => {
        call.setState(State.Trying)
        expect(call.state).toEqual('trying')
      })

      it('set state to Recovering', () => {
        call.setState(State.Recovering)
        expect(call.state).toEqual('recovering')
      })

      it('set state to Ringing', () => {
        call.setState(State.Ringing)
        expect(call.state).toEqual('ringing')
      })

      it('set state to Answering', () => {
        call.setState(State.Answering)
        expect(call.state).toEqual('answering')
      })

      it('set state to Early', () => {
        call.setState(State.Early)
        expect(call.state).toEqual('early')
      })

      it('set state to Active', () => {
        call.setState(State.Active)
        expect(call.state).toEqual('active')
      })

      it('set state to Held', () => {
        call.setState(State.Held)
        expect(call.state).toEqual('held')
      })

      it('set state to Destroy', () => {
        call.setState(State.Destroy)
        expect(call.state).toEqual('destroy')
        expect(instance.calls).not.toHaveProperty(call.id)
        expect(isQueued('signalwire.rtc.mediaError', call.id)).toEqual(false)

      })

      it('set state to Purge', () => {
        call.setState(State.Purge)
        expect(call.state).toEqual('purge')
        expect(instance.calls).not.toHaveProperty(call.id)
        expect(isQueued('signalwire.rtc.mediaError', call.id)).toEqual(false)
      })

      it('set prevState', () => {
        call.setState(State.Ringing)
        expect(call.prevState).toEqual('new')
        call.setState(State.Active)
        expect(call.prevState).toEqual('ringing')
        call.setState(State.Destroy)
        expect(call.prevState).toEqual('active')
      })
    })

    describe('.hold()', () => {
      it('should change the call state', async done => {
        Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"3a42b89f-3c37-4e5f-874f-ac8a9c021c9d","result":{"callID":"f5552e28-405a-4ebc-93f3-355b01e2df4e","action":"hold","holdState":"held","sessid":"sessid"}}'))
        await call.hold()
        expect(call.state).toEqual('held')
        done()
      })
    })

    describe('.unhold()', () => {
      it('should change the call state', async done => {
        Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"a8dcd71d-d473-4d43-b517-87b175ba7ed7","result":{"callID":"f5552e28-405a-4ebc-93f3-355b01e2df4e","action":"unhold","holdState":"active","sessid":"sessid"}}'))
        await call.unhold()
        expect(call.state).toEqual('active')
        done()
      })
    })

    describe('.toggleHold()', () => {
      it('should change the call state', async done => {
        Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"61a9d32b-d241-40d1-87b0-0d8384936ae8","result":{"callID":"f5552e28-405a-4ebc-93f3-355b01e2df4e","action":"toggleHold","holdState":"held","sessid":"sessid"}}'))
        await call.toggleHold()
        expect(call.state).toEqual('held')

        Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"a8dcd71d-d473-4d43-b517-87b175ba7ed7","result":{"callID":"f5552e28-405a-4ebc-93f3-355b01e2df4e","action":"toggleHold","holdState":"active","sessid":"sessid"}}'))
        await call.toggleHold()
        expect(call.state).toEqual('active')
        done()
      })
    })

    describe('.hangup()', () => {
      it('should change the call state and send verto.bye with execute true', async done => {
        Connection.mockSend.mockClear()
        await call.hangup({ cause: 'T01', code: 'Test01' })
        expect(call.cause).toEqual('T01')
        expect(call.causeCode).toEqual('Test01')
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        done()
      })

      it('should hangup SS if present', async done => {
        Connection.mockSend.mockClear()
        const ss = await call.startScreenShare()
        ss.hangup = jest.fn()
        await call.hangup()
        expect(ss.hangup).toHaveBeenCalledTimes(1)
        done()
      })
    })

    describe('.startScreenShare()', () => {
      it('should attach a new screenShareCall to the originator', async done => {
        call.extension = '3599'
        const ss = await call.startScreenShare()
        expect(ss).toEqual(call.screenShare)
        expect(ss.options.destinationNumber).toEqual('3599;screen')
        expect(ss.options.screenShare).toEqual(true)
        expect(ss.peer.type).toEqual('offer')
        expect(ss).toBeInstanceOf(Call)

        done()
      })
    })

    describe('.stopScreenShare()', () => {
      it('should hangup screenShare if present', async done => {
        const ss = await call.startScreenShare()
        ss.hangup = jest.fn()
        call.stopScreenShare()
        expect(ss.hangup).toHaveBeenCalledTimes(1)
        done()
      })
    })
  })
}
