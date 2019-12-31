import BrowserSession from '../../src/BrowserSession'
import VertoHandler from '../../../common/src/webrtc/VertoHandler'
import Call from '../../../common/src/webrtc/Call'
import { State } from '../../src/webrtc/constants'
const Connection = require('../../../common/src/services/Connection')

export default (klass: any) => {
  const DEFAULT_PARAMS = { destinationNumber: 'x3599', remoteCallerName: 'Js Client Test', remoteCallerNumber: '1234', callerName: 'Jest Client', callerNumber: '5678' }
  describe('VertoHandler', () => {
    let instance: BrowserSession
    let handler: VertoHandler
    let call: Call
    const onNotification = jest.fn()

    const _setupCall = (params: any = {}) => {
      call = new Call(instance, { ...DEFAULT_PARAMS, ...params })
    }

    beforeEach(() => {
      instance = new klass({ host: 'example.signalwire.com', login: 'login', password: 'password', project: 'project', token: 'token' })
      onNotification.mockClear()
      instance.on('signalwire.notification', onNotification)
      handler = new VertoHandler(instance)
    })

    afterEach(() => {
      instance.off('signalwire.notification')
      Object.keys(instance.calls).forEach(k => instance.calls[k].setState(State.Purge))
    })

    describe('verto.punt', () => {
      it('should initiate the logout process', () => {
        const msg = JSON.parse('{"jsonrpc":"2.0","id":38,"method":"verto.punt","params":{}}')
        instance.disconnect = jest.fn()
        handler.handleMessage(msg)
        expect(instance.disconnect).toBeCalledTimes(1)
      })
    })

    describe('verto.invite', () => {
      it('should create a new Call in ringing state', async done => {
        await instance.connect()
        const callId = 'cd35e65f-a507-4bd2-8d21-80f36d134a2e'
        const msg = JSON.parse(`{"jsonrpc":"2.0","id":4402,"method":"verto.invite","params":{"callID":"${callId}","sdp":"SDP","caller_id_name":"Extension 1004","caller_id_number":"1004","callee_id_name":"Outbound Call","callee_id_number":"1003","display_direction":"outbound"}}`)
        handler.handleMessage(msg)
        expect(instance.calls).toHaveProperty(callId)
        expect(instance.calls[callId].id).toEqual(callId)
        expect(instance.calls[callId].state).toEqual('ringing')
        expect(instance.calls[callId].prevState).toEqual('new')
        done()
      })
    })

    describe('with an active outbound Call', () => {
      beforeEach(async done => {
        await instance.connect()
        _setupCall({ id: 'e2fda6dc-fc9d-4d77-8096-53bb502443b6' })
        call.handleMessage = jest.fn()
        Connection.mockSend.mockClear()
        done()
      })

      describe('verto.media', () => {
        it('should pass the msg to the call and reply back to the server', () => {
          const msg = JSON.parse('{"jsonrpc":"2.0","id":4403,"method":"verto.media","params":{"callID":"e2fda6dc-fc9d-4d77-8096-53bb502443b6","sdp":"<REMOTE-SDP>"}}')
          handler.handleMessage(msg)
          expect(call.handleMessage).toBeCalledTimes(1)
          expect(Connection.mockSend).toHaveBeenLastCalledWith({ request: { jsonrpc: '2.0', id: 4403, result: { method: 'verto.media' } } })
        })
      })

      describe('verto.answer', () => {
        it('should pass the msg to the call and reply back to the server', () => {
          const msg = JSON.parse('{"jsonrpc":"2.0","id":4404,"method":"verto.answer","params":{"callID":"e2fda6dc-fc9d-4d77-8096-53bb502443b6"}}')
          handler.handleMessage(msg)
          expect(call.handleMessage).toBeCalledTimes(1)
          expect(Connection.mockSend).toHaveBeenLastCalledWith({ request: { jsonrpc: '2.0', id: 4404, result: { method: 'verto.answer' } } })
        })
      })
    })

    // describe('verto.attach', () => {

    // })

    // describe('verto.event', () => {

    // })

    describe('verto.info', () => {
      it('should dispatch a notification', () => {
        handler.handleMessage(JSON.parse('{"jsonrpc":"2.0","id":37,"method":"verto.info","params":{"fake":"data", "test": "data"}}'))
        expect(onNotification).toBeCalledWith({ type: 'event', fake: 'data', test: 'data' })
      })
    })

    describe('verto.clientReady', () => {
      it('should dispatch a notification', () => {
        handler.handleMessage(JSON.parse('{"jsonrpc":"2.0","id":37,"method":"verto.clientReady","params":{"reattached_sessions":[]}}'))
        expect(onNotification).toBeCalledWith({ type: 'vertoClientReady', reattached_sessions: [] })

        handler.handleMessage(JSON.parse('{"jsonrpc":"2.0","id":37,"method":"verto.clientReady","params":{"reattached_sessions":["test"]}}'))
        expect(onNotification).toBeCalledWith({ type: 'vertoClientReady', reattached_sessions: ['test'] })
      })
    })
  })
}
