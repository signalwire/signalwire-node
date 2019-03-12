import { Execute, ProviderAdd, ProviderRemove, Connect, Subscription } from '../src/messages/Blade'
import { Login, Invite, Answer, Bye, Modify, Info, Result } from '../src/messages/Verto'

describe('Messages', function () {
  describe('BladeConnect', function () {
    it('should match struct without sessionId', function () {
      const message = new Connect({ project: 'project', token: 'token' }).request
      const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"blade.connect","params":{"authentication":{"project":"project","token":"token"},"version":{"major":2,"minor":1,"revision":0}}}`)
      expect(message).toEqual(res)
    })
    it('should match struct with sessionId', function () {
      const sessionId = '5c26c8d1-adcc-4b46-aa32-d9550022fddc'
      const message = new Connect({ project: 'project', token: 'token' }, sessionId).request
      const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"blade.connect","params":{"authentication":{"project":"project","token":"token"},"version":{"major":2,"minor":1,"revision":0},"sessionid":"${sessionId}"}}`)
      expect(message).toEqual(res)
    })
  })

  describe('BladeExecute', function () {
    it('Request should match struct', function () {
      const params = {
        requester_nodeid: 'S1',
        responder_nodeid: 'S2',
        protocol: 'myprot',
        method: 'sayHello',
        params: { name: 'Joe' }
      }
      const message = new Execute(params).request
      const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"blade.execute","params":{"requester_nodeid":"S1","responder_nodeid":"S2","protocol":"myprot","method":"sayHello","params":{"name":"Joe"}}}`)
      expect(message).toEqual(res)
    })
    it('Response should match struct', function () {
      const params = {
        requester_nodeid: 'S1',
        responder_nodeid: 'S2',
        protocol: 'myprot',
        result: { msg: 'Hello Joe!' }
      }
      const message = new Execute(params).request
      const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","result":{"requester_nodeid":"S1","responder_nodeid":"S2","protocol":"myprot","result":{"msg":"Hello Joe!"}}}`)
      expect(message).toEqual(res)
    })
  })

  describe('BladeProtocol', function () {
    describe('ProviderAdd', function () {
      it('should match struct', function () {
        const message = new ProviderAdd({
          protocol: 'bench',
          params: {
            default_method_execute_access: 1,
            default_channel_broadcast_access: 1,
            default_channel_subscribe_access: 1,
            channels: [
              { name: 'swbench', broadcast_access: 1, subscribe_access: 1 }
            ],
            methods: [
              { name: 'swbench', execute_access: 1 }
            ]
          }
        }).request
        const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"blade.protocol","params":{"command":"provider.add","protocol":"bench","params":{"default_method_execute_access":1,"default_channel_broadcast_access":1,"default_channel_subscribe_access":1,"channels":[{"name":"swbench","broadcast_access":1,"subscribe_access":1}],"methods":[{"execute_access":1,"name": "swbench"}]}}}`)
        expect(message).toEqual(res)
      })
    })

    describe('ProviderRemove', function () {
      it('should match struct', function () {
        const message = new ProviderRemove('bench').request
        const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"blade.protocol","params":{"command":"provider.remove","protocol":"bench"}}`)
        expect(message).toEqual(res)
      })
    })
  })

  describe('BladeSubscription', function () {
    describe('Add', function () {
      it('should match struct', function () {
        const message = new Subscription({
          command: 'add',
          protocol: 'myprotocol',
          channels: ['myprotocol.channel']
        }).request
        const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"blade.subscription","params":{"command":"add","protocol":"myprotocol","channels":["myprotocol.channel"]}}`)
        expect(message).toEqual(res)
      })
    })
  })

  describe('Verto', function () {
    describe('Login', function () {
      it('should match struct', function () {
        const message = new Login('login', 'password', null).request
        const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"login","params":{"login":"login","passwd":"password","loginParams":{},"userVariables":{}}}`)
        expect(message).toEqual(res)
      })

      it('should match struct with sessid', function () {
        const message = new Login('login', 'password', '123456789').request
        const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"login","params":{"login":"login","passwd":"password","sessid":"123456789","loginParams":{},"userVariables":{}}}`)
        expect(message).toEqual(res)
      })
    })

    describe('Invite', function () {
      it('should match struct', function () {
        const message = new Invite({ sessid: '123456789', sdp: '<SDP>', dialogParams: { remoteSdp: '<SDP>', callerId: 'test' } }).request
        const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"verto.invite","params":{"sessid":"123456789","sdp":"<SDP>","dialogParams":{"callerId":"test"}}}`)
        expect(message).toEqual(res)
      })
    })

    describe('Answer', function () {
      it('should match struct', function () {
        const message = new Answer({ sessid: '123456789', sdp: '<SDP>', dialogParams: { remoteSdp: '<SDP>', callerId: 'test' } }).request
        const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"verto.answer","params":{"sessid":"123456789","sdp":"<SDP>","dialogParams":{"callerId":"test"}}}`)
        expect(message).toEqual(res)
      })
    })

    describe('Bye', function () {
      it('should match struct', function () {
        const message = new Bye({ sessid: '123456789', dialogParams: { remoteSdp: '<SDP>', callerId: 'test' } }).request
        const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"verto.bye","params":{"sessid":"123456789","dialogParams":{"callerId":"test"}}}`)
        expect(message).toEqual(res)
      })
    })

    describe('Modify', function () {
      it('should match struct', function () {
        const message = new Modify({ sessid: '123456789', action: 'hold', dialogParams: { remoteSdp: '<SDP>', callerId: 'test' } }).request
        const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"verto.modify","params":{"sessid":"123456789","action":"hold","dialogParams":{"callerId":"test"}}}`)
        expect(message).toEqual(res)
      })
    })

    describe('Info', function () {
      it('should match struct', function () {
        const message = new Info({ sessid: '123456789', dtmf: '0', dialogParams: { remoteSdp: '<SDP>', callerId: 'test' } }).request
        const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"verto.info","params":{"sessid":"123456789","dtmf":"0","dialogParams":{"callerId":"test"}}}`)
        expect(message).toEqual(res)
      })
    })

  })
})
