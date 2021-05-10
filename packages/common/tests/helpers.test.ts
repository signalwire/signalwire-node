import { objEmpty, mutateLiveArrayData, safeParseJson, checkWebSocketHost, destructResponse } from '../src/util/helpers'

describe('Helpers functions', () => {
  describe('objEmpty', () => {
    it('should return true if object has no values', () => {
      const tmp = { test: 1234 }
      expect(objEmpty(tmp)).toEqual(false)

      const tmp1 = {}
      expect(objEmpty(tmp1)).toEqual(true)
    })
  })

  describe('mutateLiveArrayData', () => {
    it('should filter data from liveArray', () => {
      const data = JSON.parse('[{"variables":{"cantina_role":"moderator","uuid":"2f007418-ce12-4ee0-9fae-504071ff1ce5","moderator":true,"performer":false,"canShare":true,"conferenceName":"testing","conferenceUUID":"0bd3e541-e777-4cdd-ae95-5ad2f8926df6","conferenceMD5":"ae2b1fca515949e5d54fb22b8ed95575","conferenceDisplayName":"testing","jsockUUID":"d7e5616d-b59e-47e1-aef5-6b29009ddd55","localVideoCanvas":false,"noLocalVideo":false},"audio":{"muted":false,"deaf":false,"onHold":false,"talking":false,"floor":true,"zoneID":0,"energyScore":1,"energyLevel":200,"volumeInLevel":0,"volumeOutLevel":0,"blockingNoise":false,"autoGainControl":true,"echoCancellation":true,"noiseSuppression":true,"secondSource":false,"studioAudio":false,"deviceAudio":false},"connectionState":{"quality":4,"lowBitrateMode":false},"iceConnectionState":"established","video":{"flow":"sendrecv","visible":true,"motionQuality":0,"cloaked":false,"onScreen":true,"noRecover":false,"screenShare":false,"handRaised":false,"fullScreen":false,"autoOverlay":true,"avatarPresented":false,"mediaFlow":"sendRecv","muted":false,"floor":true,"reservationID":null,"videoLayerID":0,"canvasID":0,"watchingCanvasID":0}},{"memberID":1,"callerIDNumber":"steve@twojax.net","callerIDName":"Steve Murphy","company":"TWO JAX, LLC"},"public"]')
      const options = JSON.parse('{"variables":{"cantina_role":"moderator","uuid":"2f007418-ce12-4ee0-9fae-504071ff1ce5","moderator":true,"performer":false,"canShare":true,"conferenceName":"testing","conferenceUUID":"0bd3e541-e777-4cdd-ae95-5ad2f8926df6","conferenceMD5":"ae2b1fca515949e5d54fb22b8ed95575","conferenceDisplayName":"testing","jsockUUID":"d7e5616d-b59e-47e1-aef5-6b29009ddd55","localVideoCanvas":false,"noLocalVideo":false},"audio":{"muted":false,"deaf":false,"onHold":false,"talking":false,"floor":true,"zoneID":0,"energyScore":1,"energyLevel":200,"volumeInLevel":0,"volumeOutLevel":0,"blockingNoise":false,"autoGainControl":true,"echoCancellation":true,"noiseSuppression":true,"secondSource":false,"studioAudio":false,"deviceAudio":false},"connectionState":{"quality":4,"lowBitrateMode":false},"iceConnectionState":"established","video":{"flow":"sendrecv","visible":true,"motionQuality":0,"cloaked":false,"onScreen":true,"noRecover":false,"screenShare":false,"handRaised":false,"fullScreen":false,"autoOverlay":true,"avatarPresented":false,"mediaFlow":"sendRecv","muted":false,"floor":true,"reservationID":null,"videoLayerID":0,"canvasID":0,"watchingCanvasID":0}}')
      expect(mutateLiveArrayData(data)).toStrictEqual({ participantId: 1, participantNumber: 'steve@twojax.net', participantName: 'Steve Murphy', participantCompany: 'TWO JAX, LLC', visibility: 'public', ...options })
    })
  })

  describe('safeParseJson', () => {
    it('should parse a valid JSON string', () => {
      const jsonString = '{"jsonrpc":"2.0","id":"fb5daf53-14f9-4972-8ece-310824054da8","method":"blade.execute"}'
      expect(safeParseJson(jsonString)).toMatchObject({ jsonrpc: '2.0', id: 'fb5daf53-14f9-4972-8ece-310824054da8', method: 'blade.execute'})
    })

    it('return the input parameter if its not a string', () => {
      const obj = { jsonrpc: '2.0', id: 'fb5daf53-14f9-4972-8ece-310824054da8', method: 'blade.execute' }
      // @ts-ignore
      expect(safeParseJson(obj)).toMatchObject({ jsonrpc: '2.0', id: 'fb5daf53-14f9-4972-8ece-310824054da8', method: 'blade.execute'})
      // @ts-ignore
      expect(safeParseJson(null)).toEqual(null)
      // @ts-ignore
      expect(safeParseJson(true)).toEqual(true)
    })
  })

  describe('checkWebSocketHost()', () => {

    describe('on a signalwire space', () => {
      it('should add wss protocol and suffix if not present', () => {
        expect(checkWebSocketHost('example.signalwire.com')).toEqual('wss://example.signalwire.com')
      })

      it('should dont add suffix if its already specified', () => {
        const hostOk = 'wss://example.signalwire.com:9999/something/else'
        expect(checkWebSocketHost('example.signalwire.com:9999/something/else')).toEqual(hostOk)
        expect(checkWebSocketHost(hostOk)).toEqual(hostOk)
      })

      it('should do nothing with protocol and suffix already specified', () => {
        expect(checkWebSocketHost('ws://example.signalwire.com:8888')).toEqual('ws://example.signalwire.com:8888')
      })
    })

    describe('on an host that is not a signalwire space', () => {
      it('should add wss protocol if not present', () => {
        expect(checkWebSocketHost('example.com')).toEqual('wss://example.com')
        expect(checkWebSocketHost('test.example.com:8082')).toEqual('wss://test.example.com:8082')
      })

      it('should do nothing if protocol is already present', () => {
        expect(checkWebSocketHost('ws://example.com')).toEqual('ws://example.com')
        expect(checkWebSocketHost('wss://test.example.com:8082')).toEqual('wss://test.example.com:8082')
      })
    })

  })

  describe('destructResponse()', () => {
    it('should handle normal json-rpc result', () => {
      const msg = JSON.parse('{"jsonrpc":"2.0","id":"123","result":{"message":"CALL CREATED","callID":"call-id","sessid":"sid"}}')
      expect(destructResponse(msg)).toEqual({ result: msg.result })
    })

    it('should handle normal json-rpc error', () => {
      const msg = JSON.parse('{"jsonrpc":"2.0","id":"123","error":{"message":"Random Error","callID":"call-id","code":"123"}}')
      expect(destructResponse(msg)).toEqual({ error: msg.error })
    })

    it('should handle blade.execute result', () => {
      const msg = JSON.parse('{"jsonrpc":"2.0","id":"uuid","result":{"requester_nodeid":"req-id","responder_nodeid":"res-id","result":{"code":"200","message":"Playing","call_id":"call-id"}}}')
      expect(destructResponse(msg)).toEqual({ result: { code: '200', message: 'Playing', call_id: 'call-id' } })
    })

    it('should handle blade.execute result', () => {
      const msg = JSON.parse('{"jsonrpc":"2.0","id":"uuid","error":{"requester_nodeid":"req-id","responder_nodeid":"res-id","code":-32601,"message":"msg"}}')
      expect(destructResponse(msg)).toEqual({ error: msg.error })
    })

    it('should handle Verto result over Blade', () => {
      const vertoNoResult = JSON.parse('{"jsonrpc":"2.0","id":"uuid","result":{"requester_nodeid":"req-id","responder_nodeid":"res-id","result":{"code":"200","node_id":"node-id","result":{}}}}')
      expect(destructResponse(vertoNoResult)).toEqual({ result: { node_id: 'node-id' } })

      const vertoResult = JSON.parse('{"jsonrpc":"2.0","id":"uuid","result":{"requester_nodeid":"req-id","responder_nodeid":"res-id","result":{"code":"200","node_id":"node-id","result":{"jsonrpc":"2.0","id":"verto-uuid","result":{"message":"CALL CREATED","callID":"call-id"}}}}}')
      expect(destructResponse(vertoResult)).toEqual({ result: { message: 'CALL CREATED', callID: 'call-id', node_id: 'node-id' } })
    })

    it('should handle Verto error over Blade', () => {
      const msg = JSON.parse('{"jsonrpc":"2.0","id":"uuid","result":{"requester_nodeid":"req-id","responder_nodeid":"res-id","result":{"code":"200","node_id":"node-id","result":{"jsonrpc":"2.0","id":"123","error":{"message":"Random Error","callID":"call-id","code":"123"}}}}}')
      expect(destructResponse(msg)).toEqual({ error: { code: '123', message: 'Random Error', callID: 'call-id' } })
    })
  })
})
