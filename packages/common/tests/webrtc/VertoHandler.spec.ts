import VertoHandler from '../../../common/src/webrtc/VertoHandler'
import Call from '../../../common/src/webrtc/Call'
import { State, Notification, ConferenceAction } from '../../src/webrtc/constants'
const Connection = require('../../../common/src/services/Connection')

export default (instance: any) => {
  const DEFAULT_PARAMS = { destinationNumber: 'x3599', remoteCallerName: 'Js Client Test', remoteCallerNumber: '1234', callerName: 'Jest Client', callerNumber: '5678' }
  describe('VertoHandler', () => {
    let call: Call
    const onNotification = jest.fn()

    const _setupCall = (params: any = {}) => {
      call = new Call(instance, { ...DEFAULT_PARAMS, ...params })
    }

    beforeEach(() => {
      instance.sessionid = 'sessid'
      onNotification.mockClear()
      // instance.off('signalwire.notification', onNotification)
      instance.on('signalwire.notification', onNotification)
    })

    afterEach(() => {
      instance.off('signalwire.notification')
      Object.keys(instance.calls).forEach(k => instance.calls[k].setState(State.Purge))
    })

    describe('verto.punt', () => {
      it('should initiate the logout process', () => {
        instance.disconnect = jest.fn()
        const msg = JSON.parse('{"jsonrpc":"2.0","id":38,"method":"verto.punt","params":{}}')
        VertoHandler(instance, msg)
        expect(instance.disconnect).toBeCalledTimes(1)
      })
    })

    describe('verto.invite', () => {
      it('should create a new Call in ringing state', () => {
        const callId = 'cd35e65f-a507-4bd2-8d21-80f36d134a2e'
        const msg = JSON.parse(`{"jsonrpc":"2.0","id":4402,"method":"verto.invite","params":{"callID":"${callId}","sdp":"SDP","caller_id_name":"Extension 1004","caller_id_number":"1004","callee_id_name":"Outbound Call","callee_id_number":"1003","display_direction":"outbound"}}`)
        VertoHandler(instance, msg)
        expect(instance.calls).toHaveProperty(callId)
        expect(instance.calls[callId].id).toEqual(callId)
        expect(instance.calls[callId].state).toEqual('ringing')
        expect(instance.calls[callId].prevState).toEqual('new')
      })
    })

    describe('with an active outbound Call', () => {
      const callId = 'e2fda6dc-fc9d-4d77-8096-53bb502443b6'
      beforeEach(() => {
        _setupCall({ id: callId })
        call.handleMessage = jest.fn()
        Connection.mockSend.mockClear()
      })

      describe('verto.media', () => {
        it('should pass the msg to the call and reply back to the server', () => {
          const msg = JSON.parse(`{"jsonrpc":"2.0","id":4403,"method":"verto.media","params":{"callID":"${callId}","sdp":"<REMOTE-SDP>"}}`)
          VertoHandler(instance, msg)
          expect(Connection.mockSend).toHaveBeenLastCalledWith({ request: { jsonrpc: '2.0', id: 4403, result: { method: 'verto.media' } } })
        })
      })

      describe('verto.answer', () => {
        it('should pass the msg to the call and reply back to the server', () => {
          const msg = JSON.parse(`{"jsonrpc":"2.0","id":4404,"method":"verto.answer","params":{"callID":"${callId}"}}`)
          VertoHandler(instance, msg)
          expect(Connection.mockSend).toHaveBeenLastCalledWith({ request: { jsonrpc: '2.0', id: 4404, result: { method: 'verto.answer' } } })
        })
      })

      describe('verto.bye', () => {
        it('should pass the msg to the call and reply back to the server', () => {
          const msg = JSON.parse(`{"jsonrpc":"2.0","id":4405,"method":"verto.bye","params":{"callID":"${callId}","causeCode":16,"cause":"NORMAL_CLEARING"}}`)
          VertoHandler(instance, msg)
          expect(Connection.mockSend).toHaveBeenLastCalledWith({ request: { jsonrpc: '2.0', id: 4405, result: { method: 'verto.bye' } } })
        })
      })

      describe('verto.display', () => {
        it('should pass the msg to the call and reply back to the server', () => {
          const msg = JSON.parse(`{"jsonrpc":"2.0","id":4406,"method":"verto.display","params":{"callID":"${callId}","display_name":"example","display_number":"1234","caller_id_name":"","caller_id_number":"0000000000","callee_id_name":"Outbound Call","callee_id_number":"1234","display_direction":"inbound"}}`)
          VertoHandler(instance, msg)
          expect(Connection.mockSend).toHaveBeenLastCalledWith({ request: { jsonrpc: '2.0', id: 4406, result: { method: 'verto.display' } } })
        })
      })
    })

    describe('verto.event', () => {
      it('should handle the logo-info event', () => {
        // TODO: add call object to the notification
        const payload = JSON.parse(`{"jsonrpc":"2.0","id":37,"method":"verto.event","params":{"eventChannel":"${instance.sessionid}","eventData":{"contentType":"logo-info","callID":"52ae5c63-bf9a-456f-97e0-3bb06415e01f","logoURL":"data:image/png;base64,long-string"}}}`)
        VertoHandler(instance, payload)
        expect(onNotification).toBeCalledWith({ type: Notification.ConferenceUpdate, action: ConferenceAction.LogoInfo, logo: 'data:image/png;base64,long-string' })
      })

      it('should handle the layout-info event', () => {
        const payload = JSON.parse(`{"jsonrpc":"2.0","id":37,"method":"verto.event","params":{"eventChannel":"${instance.sessionid}","eventData":{"contentType":"layout-info","canvasType":"mcu-personal-canvas","callID":"8cbece07-487f-4191-8e8f-b785f1345bc4","canvasInfo":{"canvasID":-1,"totalLayers":1,"layersUsed":0,"layoutFloorID":0,"layoutName":"1x1","canvasLayouts":[],"scale":360}}}}`)
        VertoHandler(instance, payload)
        // TODO: Update specs with new layout structure
        expect(onNotification).toBeCalledTimes(1)
      })

      it('should handle the layer-info event', () => {
        const payload = JSON.parse(`{"jsonrpc":"2.0","id":37,"method":"verto.event","params":{"eventChannel":"${instance.sessionid}","eventData":{"contentType":"layer-info","currentLayerIdx":-1,"canvasType":"mcu-personal-canvas","callID":"8cbece07-487f-4191-8e8f-b785f1345bc4"}}}`)
        VertoHandler(instance, payload)
        // TODO: Update specs with new layout structure
        expect(onNotification).toBeCalledTimes(1)
      })
    })

    describe('verto.info', () => {
      it('should dispatch a notification', () => {
        VertoHandler(instance, JSON.parse('{"jsonrpc":"2.0","id":37,"method":"verto.info","params":{"fake":"data", "test": "data"}}'))
        expect(onNotification).toBeCalledWith({ type: 'event', fake: 'data', test: 'data' })
      })
    })

    describe('verto.clientReady', () => {
      it('should dispatch a notification', () => {
        VertoHandler(instance, JSON.parse('{"jsonrpc":"2.0","id":37,"method":"verto.clientReady","params":{"reattached_sessions":[]}}'))
        expect(onNotification).toBeCalledWith({ type: 'vertoClientReady', reattached_sessions: [] })

        VertoHandler(instance, JSON.parse('{"jsonrpc":"2.0","id":37,"method":"verto.clientReady","params":{"reattached_sessions":["test"]}}'))
        expect(onNotification).toBeCalledWith({ type: 'vertoClientReady', reattached_sessions: ['test'] })
      })
    })
  })
}
