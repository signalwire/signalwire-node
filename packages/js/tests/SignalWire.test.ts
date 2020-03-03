import behaveLikeBaseSession from '../../common/tests/behaveLike/BaseSession.spec'
import behaveLikeBrowserSession from '../../common/tests/behaveLike/BrowserSession.spec'
import behaveLikeReceive from '../../common/tests/behaveLike/Receive.spec'
import behaveLikeSetup from '../../common/tests/behaveLike/Setup.spec'
import { BladeDisconnect } from '../../common/tests/behaveLike/BladeMessages.spec'
import { Subscribe, Unsubscribe, Broadcast } from '../../common/src/messages/Verto'
import { Execute } from '../../common/src/messages/Blade'
import SignalWire from '../src/SignalWire'
const Connection = require('../../common/src/services/Connection')

describe('SignalWire Web', () => {
  const _buildInstance = () => {
    const instance = new SignalWire({ project: 'project', token: 'token' })
    // @ts-ignore
    instance.connection = Connection.default()
    return instance
  }
  let instance = _buildInstance()
  const nodeId = 'node-uuid'

  behaveLikeBaseSession.call(this, instance)
  behaveLikeBrowserSession.call(this, instance)
  behaveLikeReceive.call(this, instance)
  behaveLikeSetup.call(this, instance)
  BladeDisconnect.call(this, instance)

  beforeEach(() => {
    instance = _buildInstance()
    instance.subscriptions = {}
    Connection.mockSend.mockClear()
    Connection.default.mockClear()
    Connection.mockClose.mockClear()
  })

  describe('.validateOptions()', () => {
    it('should return false with invalid options', () => {
      instance.options = { host: 'example.fs.edo', login: '1008', passwd: 'pw' }
      expect(instance.validateOptions()).toEqual(false)
    })

    it('should return true with valid options', () => {
      instance.options = { project: 'project', token: 'token' }
      expect(instance.validateOptions()).toEqual(true)
    })
  })

  describe('.vertoSubscribe()', () => {
    it('should execute the proper verto.subscribe message', async () => {
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":77,"result":{"subscribedChannels":["channel-test-name"],"sessid":"sessid-xyz"}}'))
      const response = await instance.vertoSubscribe({ nodeId, channels: ['channel-test-name'] })
      expect(response.subscribedChannels).toEqual(['channel-test-name'])
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      const params = {
        message: new Subscribe({ sessid: instance.sessionid, eventChannel: ['channel-test-name'] }).request,
        node_id: nodeId
      }
      const msg = new Execute({ protocol: instance.relayProtocol, method: 'message', params })
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
    })
  })

  describe('.vertoUnsubscribe()', () => {
    it('should execute the proper verto.unsubscribe message', async () => {
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":77,"result":{"unsubscribedChannels":["channel-test-name"],"sessid":"sessid-xyz"}}'))
      const response = await instance.vertoUnsubscribe({ nodeId, channels: ['channel-test-name'] })
      expect(response.unsubscribedChannels).toEqual(['channel-test-name'])
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      const params = {
        message: new Unsubscribe({ sessid: instance.sessionid, eventChannel: ['channel-test-name'] }).request,
        node_id: nodeId
      }
      const msg = new Execute({ protocol: instance.relayProtocol, method: 'message', params })
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
    })
  })

  describe('.vertoBroadcast()', () => {
    it('should execute the proper verto.broadcast message', async () => {
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":77,"result":{"sessid":"sessid-xyz"}}'))
      const response = await instance.vertoBroadcast({ nodeId, channel: 'channel', data: { example: 'cmd' } })
      expect(response.sessid).toEqual('sessid-xyz')
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      const params = {
        message: new Broadcast({ sessid: instance.sessionid, eventChannel: 'channel', data: { example: 'cmd' } }).request,
        node_id: nodeId
      }
      const msg = new Execute({ protocol: instance.relayProtocol, method: 'message', params })
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
    })
  })
})
