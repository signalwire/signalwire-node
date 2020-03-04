import VertoHandler from './VertoHandler'
import Call from './Call'
import { Notification, ConferenceAction } from './constants'
import Conference from './Conference'
const Connection = require('../../../common/src/services/Connection')

jest.mock('./Conference')

export default (instance: any) => {
  describe('VertoHandler', () => {
    let call: Call
    const onNotification = jest.fn()
    const callId = 'e2fda6dc-fc9d-4d77-8096-53bb502443b6'

    beforeEach(() => {
      instance.sessionid = 'sessid'
      call = new Call(instance, { id: callId, destinationNumber: 'x3599', remoteCallerName: 'Js Client Test', remoteCallerNumber: '1234', callerName: 'Jest Client', callerNumber: '5678' })
      instance.on('signalwire.notification', onNotification)
      onNotification.mockClear()
    })

    afterEach(() => {
      instance.off('signalwire.notification')
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

    describe('verto.event', () => {
      describe('with pvtData', () => {
        it('should handle the liveArray-join', () => {
          const payload = JSON.parse(`{"jsonrpc":"2.0","id":26017,"method":"verto.event","params":{"eventChannel":"${instance.sessionid}","eventType":"channelPvtData","pvtData":{"callID":"${callId}","action":"conference-liveArray-join","laChannel":"conference-liveArray.3594@cantina.freeswitch.org","laName":"3594","role":"moderator","chatID":"conf+3594@cantina.freeswitch.org","conferenceMemberID":"455","canvasCount":1,"modChannel":"conference-mod.3594@cantina.freeswitch.org","chatChannel":"conference-chat.3594@cantina.freeswitch.org","infoChannel":"conference-info.3594@cantina.freeswitch.org"}}}`)
          VertoHandler(instance, payload)
          expect(Conference).toHaveBeenCalledTimes(1)
          expect(instance.calls[callId].conference).toBeInstanceOf(Conference)
          expect(instance.calls[callId].conference.join).toHaveBeenCalledTimes(1)
          expect(instance.calls[callId].conference.join).toHaveBeenCalledWith(payload.params.pvtData)
        })

        it('should handle the liveArray-part', () => {
          const payload = JSON.parse(`{"jsonrpc":"2.0","id":26064,"method":"verto.event","params":{"eventChannel":"${instance.sessionid}","eventType":"channelPvtData","pvtData":{"callID":"${callId}","action":"conference-liveArray-part","laChannel":"conference-liveArray.3594@cantina.freeswitch.org","laName":"3594","role":"moderator","chatID":"conf+3594@cantina.freeswitch.org","conferenceMemberID":"455","canvasCount":1,"modChannel":"conference-mod.3594@cantina.freeswitch.org","chatChannel":"conference-chat.3594@cantina.freeswitch.org","infoChannel":"conference-info.3594@cantina.freeswitch.org"}}}`)
          instance.calls[callId].conference = new Conference(instance)
          VertoHandler(instance, payload)
          expect(instance.calls[callId].conference.part).toHaveBeenCalledTimes(1)
          expect(instance.calls[callId].conference.part).toHaveBeenCalledWith(payload.params.pvtData)
        })
      })

      describe('with eventChannel equal to the sessionId', () => {
        it('should handle the logo-info event', () => {
          const payload = JSON.parse(`{"jsonrpc":"2.0","id":37,"method":"verto.event","params":{"eventChannel":"${instance.sessionid}","eventData":{"contentType":"logo-info","callID":"${callId}","logoURL":"data:image/png;base64,long-string"}}}`)
          VertoHandler(instance, payload)
          expect(onNotification).toBeCalledWith({ type: Notification.ConferenceUpdate, action: ConferenceAction.LogoInfo, call: instance.calls[callId], logo: 'data:image/png;base64,long-string' })
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
