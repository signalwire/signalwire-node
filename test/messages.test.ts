import BladeConnect from '../src/blade/BladeConnect'
import { BladeExecuteRequest, BladeExecuteResponse } from '../src/blade/BladeExecute'
import { ProviderAdd, ProviderRemove } from '../src/blade/BladeProtocol'
import { BladeAuthorityAdd } from '../src/blade/BladeAuthority'

describe('Messages', function () {
  describe('BladeConnect', function () {
    it('should match struct without sessionId', function () {
      const message = new BladeConnect()
      const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"blade.connect","params":{"version":{"major":2,"minor":0,"revision":0}}}`)
      expect(message).toEqual(res)
    })
    it('should match struct with sessionId', function () {
      let sessionId = '5c26c8d1-adcc-4b46-aa32-d9550022fddc'
      const message = new BladeConnect(sessionId)
      const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"blade.connect","params":{"version":{"major":2,"minor":0,"revision":0},"sessionid":"${sessionId}"}}`)
      expect(message).toEqual(res)
    })
  })

  describe('BladeExecute', function () {
    it('Request should match struct', function () {
      let params = {
        requester_nodeid: "S1",
        responder_nodeid: "S2",
        protocol: 'myprot',
        method: 'sayHello',
        params: { name: 'Joe' }
      }
      const message = new BladeExecuteRequest(params)
      const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"blade.execute","params":{"requester_nodeid":"S1","responder_nodeid":"S2","protocol":"myprot","method":"sayHello","params":{"name":"Joe"}}}`)
      expect(message).toEqual(res)
    })
    it('Response should match struct', function () {
      let params = {
        requester_nodeid: "S1",
        responder_nodeid: "S2",
        protocol: 'myprot',
        result: { msg: 'Hello Joe!' }
      }
      const message = new BladeExecuteResponse(params)
      const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","result":{"requester_nodeid":"S1","responder_nodeid":"S2","protocol":"myprot","result":{"msg":"Hello Joe!"}}}`)
      expect(message).toEqual(res)
    })
  })

  describe('BladeProtocol', function () {
    describe('ProviderAdd', function () {
      it('should match struct', function () {
        const message = new ProviderAdd({
          provider_nodeid: "S1",
          protocol: 'bench',
          params: {
            default_rpc_execute_access: 1,
            default_channel_broadcast_access: 1,
            default_channel_subscribe_access: 1,
            channels: [
              { name: 'swbench', broadcast_access: 1, subscribe_access: 1 }
            ]
          }
        })
        const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"blade.protocol","params":{"command":"provider.add","provider_nodeid":"S1","protocol":"bench","params":{"default_rpc_execute_access":1,"default_channel_broadcast_access":1,"default_channel_subscribe_access":1,"channels":[{"name":"swbench","broadcast_access":1,"subscribe_access":1}]}}}`)
        expect(message).toEqual(res)
      })
    })

    describe('ProviderRemove', function () {
      it('should match struct', function () {
        const message = new ProviderRemove('S1', 'bench')
        const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"blade.protocol","params":{"command":"provider.remove","provider_nodeid":"S1","protocol":"bench"}}`)
        expect(message).toEqual(res)
      })
    })
  })

  describe('BladeAuthority', function () {
    describe('Add', function () {
      it('should match struct', function () {
        const message = new BladeAuthorityAdd('S1')
        const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"blade.authority","params":{"command":"add","authority_nodeid":"S1"}}`)
        expect(message).toEqual(res)
      })
    })
  })
})