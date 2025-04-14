import {
  objEmpty,
  mutateLiveArrayData,
  safeParseJson,
  isDefined,
  checkWebSocketHost,
  destructResponse,
  adaptToAsyncAPI,
} from '../src/util/helpers'

describe('Helpers functions', () => {
  describe('objEmpty', () => {
    it('should return true if object has no values', () => {
      const tmp = {test: 1234}
      expect(objEmpty(tmp)).toEqual(false)

      const tmp1 = {}
      expect(objEmpty(tmp1)).toEqual(true)
    })
  })

  describe('mutateLiveArrayData', () => {
    it('should filter data from liveArray', () => {
      const data = JSON.parse(
        '["0067","email@domain.com","Js Client Test","opus@48000","{\\"audio\\":{\\"muted\\":false,\\"deaf\\":false,\\"onHold\\":false,\\"talking\\":true,\\"floor\\":true,\\"energyScore\\":1159},\\"video\\":{\\"visible\\":true,\\"videoOnly\\":false,\\"avatarPresented\\":false,\\"mediaFlow\\":\\"sendRecv\\",\\"muted\\":false,\\"floor\\":true,\\"reservationID\\":null,\\"roleID\\":null,\\"videoLayerID\\":1},\\"oldStatus\\":\\"TALKING (FLOOR) VIDEO (FLOOR)\\"}",{"email":"email","avatar":"avatar"},null]',
      )
      const media = JSON.parse(
        '{"audio":{"muted":false,"deaf":false,"onHold":false,"talking":true,"floor":true,"energyScore":1159},"video":{"visible":true,"videoOnly":false,"avatarPresented":false,"mediaFlow":"sendRecv","muted":false,"floor":true,"reservationId":null,"roleId":null,"videoLayerId":1},"oldStatus":"TALKING (FLOOR) VIDEO (FLOOR)"}',
      )
      expect(mutateLiveArrayData(data)).toMatchObject({
        participantId: 67,
        participantNumber: 'email@domain.com',
        participantName: 'Js Client Test',
        codec: 'opus@48000',
        media,
        participantData: {email: 'email', avatar: 'avatar'},
      })
    })
  })

  describe('safeParseJson', () => {
    it('should parse a valid JSON string', () => {
      const jsonString =
        '{"jsonrpc":"2.0","id":"fb5daf53-14f9-4972-8ece-310824054da8","method":"blade.execute"}'
      expect(safeParseJson(jsonString)).toMatchObject({
        jsonrpc: '2.0',
        id: 'fb5daf53-14f9-4972-8ece-310824054da8',
        method: 'blade.execute',
      })
    })

    it('return the input parameter if its not a string', () => {
      const obj = {
        jsonrpc: '2.0',
        id: 'fb5daf53-14f9-4972-8ece-310824054da8',
        method: 'blade.execute',
      }
      // @ts-ignore
      expect(safeParseJson(obj)).toMatchObject({
        jsonrpc: '2.0',
        id: 'fb5daf53-14f9-4972-8ece-310824054da8',
        method: 'blade.execute',
      })
      // @ts-ignore
      expect(safeParseJson(null)).toEqual(null)
      // @ts-ignore
      expect(safeParseJson(true)).toEqual(true)
    })
  })

  describe('isDefined', () => {
    it('should return true if the variable is defined', () => {
      const obj = {key: 'value'}
      expect(isDefined(obj.key)).toEqual(true)
    })

    it('should return false if the variable is undefined', () => {
      const obj = {key: 'value'}
      // @ts-ignore
      expect(isDefined(obj.key2)).toEqual(false)
      expect(isDefined(undefined)).toEqual(false)
      delete obj.key
      expect(isDefined(obj.key)).toEqual(false)
    })
  })

  describe('checkWebSocketHost()', () => {
    describe('on a signalwire space', () => {
      it('should add wss protocol and suffix if not present', () => {
        expect(checkWebSocketHost('example.signalwire.com')).toEqual(
          'wss://example.signalwire.com',
        )
      })

      it('should dont add suffix if its already specified', () => {
        const hostOk = 'wss://example.signalwire.com:9999/something/else'
        expect(
          checkWebSocketHost('example.signalwire.com:9999/something/else'),
        ).toEqual(hostOk)
        expect(checkWebSocketHost(hostOk)).toEqual(hostOk)
      })

      it('should do nothing with protocol and suffix already specified', () => {
        expect(checkWebSocketHost('ws://example.signalwire.com:8888')).toEqual(
          'ws://example.signalwire.com:8888',
        )
      })
    })

    describe('on an host that is not a signalwire space', () => {
      it('should add wss protocol if not present', () => {
        expect(checkWebSocketHost('example.com')).toEqual('wss://example.com')
        expect(checkWebSocketHost('test.example.com:8082')).toEqual(
          'wss://test.example.com:8082',
        )
      })

      it('should do nothing if protocol is already present', () => {
        expect(checkWebSocketHost('ws://example.com')).toEqual(
          'ws://example.com',
        )
        expect(checkWebSocketHost('wss://test.example.com:8082')).toEqual(
          'wss://test.example.com:8082',
        )
      })
    })
  })

  describe('destructResponse()', () => {
    it('should handle normal json-rpc result', () => {
      const msg = JSON.parse(
        '{"jsonrpc":"2.0","id":"123","result":{"message":"CALL CREATED","callID":"call-id","sessid":"sid"}}',
      )
      expect(destructResponse(msg)).toEqual({result: msg.result})
    })

    it('should handle normal json-rpc error', () => {
      const msg = JSON.parse(
        '{"jsonrpc":"2.0","id":"123","error":{"message":"Random Error","callID":"call-id","code":"123"}}',
      )
      expect(destructResponse(msg)).toEqual({error: msg.error})
    })

    it('should handle blade.execute result', () => {
      const msg = JSON.parse(
        '{"jsonrpc":"2.0","id":"uuid","result":{"requester_nodeid":"req-id","responder_nodeid":"res-id","result":{"code":"200","message":"Playing","call_id":"call-id"}}}',
      )
      expect(destructResponse(msg)).toEqual({
        result: {code: '200', message: 'Playing', call_id: 'call-id'},
      })
    })

    it('should handle blade.execute result', () => {
      const msg = JSON.parse(
        '{"jsonrpc":"2.0","id":"uuid","error":{"requester_nodeid":"req-id","responder_nodeid":"res-id","code":-32601,"message":"msg"}}',
      )
      expect(destructResponse(msg)).toEqual({error: msg.error})
    })

    it('should handle Verto result over Blade', () => {
      const vertoNoResult = JSON.parse(
        '{"jsonrpc":"2.0","id":"uuid","result":{"requester_nodeid":"req-id","responder_nodeid":"res-id","result":{"code":"200","node_id":"node-id","result":{}}}}',
      )
      expect(destructResponse(vertoNoResult)).toEqual({
        result: {node_id: 'node-id'},
      })

      const vertoResult = JSON.parse(
        '{"jsonrpc":"2.0","id":"uuid","result":{"requester_nodeid":"req-id","responder_nodeid":"res-id","result":{"code":"200","node_id":"node-id","result":{"jsonrpc":"2.0","id":"verto-uuid","result":{"message":"CALL CREATED","callID":"call-id"}}}}}',
      )
      expect(destructResponse(vertoResult)).toEqual({
        result: {
          message: 'CALL CREATED',
          callID: 'call-id',
          node_id: 'node-id',
        },
      })
    })

    it('should handle Verto error over Blade', () => {
      const msg = JSON.parse(
        '{"jsonrpc":"2.0","id":"uuid","result":{"requester_nodeid":"req-id","responder_nodeid":"res-id","result":{"code":"200","node_id":"node-id","result":{"jsonrpc":"2.0","id":"123","error":{"message":"Random Error","callID":"call-id","code":"123"}}}}}',
      )
      expect(destructResponse(msg)).toEqual({
        error: {code: '123', message: 'Random Error', callID: 'call-id'},
      })
    })
  })

  describe('adaptToAsyncAPI', () => {
    it('should wrap specified methods to return a Promise', async () => {
      const target = {
        returnValue: () => 'syncResult',
        returnPromise: async () => 'asyncResult',
      }
      const proxy = adaptToAsyncAPI(target, ['returnValue'])

      const promisifiedResult = proxy.returnValue()
      expect(promisifiedResult).toBeInstanceOf(Promise)
      expect(await promisifiedResult).toEqual('syncResult')

      const asyncResult = proxy.returnPromise()
      expect(promisifiedResult).toBeInstanceOf(Promise)
      expect(await asyncResult).toEqual('asyncResult')
    })

    it('should not wrap methods not specified', () => {
      const target = {
        returnValue: () => 'syncResult',
      }
      const proxy = adaptToAsyncAPI(target, [])

      const result = proxy.returnValue()
      expect(result).toEqual('syncResult')
    })

    it('should use an async version(suffixed Async) if exist', async () => {
      const mock = jest.fn()
      const target = {
        method: mock,
        methodAsync: async () => 'result',
        anotherMethod: () => 'anotherResult',
      }
      const proxy = adaptToAsyncAPI(target, ['method', 'anotherMethod'])

      const result = await proxy.method()
      expect(mock).not.toBeCalled()
      expect(result).toEqual('result')

      const anotherResult = await proxy.anotherMethod()
      expect(mock).not.toBeCalled()
      expect(anotherResult).toEqual('anotherResult')
    })
  })

  it('Should support mutation', () => {
    const mock = jest.fn()
    const target = {
      method: () => {},
    }

    const proxy = adaptToAsyncAPI(target, ['method', 'anotherMethod'])

    proxy.method = mock

    proxy.method()
    expect(mock).toBeCalled()
  })

  it('Should handle methods relying on `this` context', () => {
    class Target {
      value = 'test'
      getValue() {
        return this.value
      }
    }

    const proxy = adaptToAsyncAPI(new Target())
    expect(proxy.getValue()).toEqual('test') // Ensure `this` is correct
  })

  it('Should handle replacing methods that rely on `this` context', () => {
    class Target {
      value = 'original'
      getValue() {
        return this.value
      }
    }

    const proxy = adaptToAsyncAPI(new Target())

    // Replace the method after proxy creation
    proxy.getValue = function () {
      return this.value.toUpperCase()
    }

    expect(proxy.getValue()).toEqual('ORIGINAL') // Should work with the new method
  })

  it('Should support getter and setter', () => {
    const mock = jest.fn()
    class Target {
      private _f = () => {}
      get v() {
        return 'value'
      }
      get f() {
        return this._f
      }
      set f(value) {
        this._f = value
      }
    }

    const proxy = adaptToAsyncAPI(new Target())
    proxy.f = mock
    proxy.f()
    expect(mock).toBeCalled()
    expect(proxy.v).toEqual('value')
  })

  it('Should support being nested', () => {
    const mock = jest.fn()
    class Target {
      private _f = () => {}
      private _v = 'value'
      get v() {
        return this._v
      }
      set v(value) {
        this._v = value
      }
      get f() {
        return this._f
      }
      set f(value) {
        this._f = value
      }
    }

    class Wrapper {
      constructor(private impl: Target) {
        impl.f = mock
      }

      get f() {
        return this.impl.f
      }

      set f(value) {
        const {impl} = this
        impl.f = value
      }

      get v() {
        return this.impl.v
      }

      set v(value) {
        const {impl} = this
        impl.v = value
      }
    }

    const proxy = adaptToAsyncAPI(new Target())
    const wrapped = new Wrapper(proxy)
    wrapped.f()
    expect(mock).toBeCalledTimes(1)
    expect(wrapped.v).toEqual('value')
    wrapped.v = 'newValue'
    expect(wrapped.v).toEqual('newValue')
    expect(proxy.v).toEqual('newValue')
    const newProxy = adaptToAsyncAPI(wrapped)
    newProxy.f = () => {}
    newProxy.f()
    expect(mock).toBeCalledTimes(1)
    wrapped.f()
    expect(mock).toBeCalledTimes(1)
    proxy.f()
    expect(mock).toBeCalledTimes(1)
  })
})
