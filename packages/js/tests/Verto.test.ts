import behaveLikeBaseSession from '../../common/tests/behaveLike/BaseSession.spec'
import behaveLikeBrowserSession from '../../common/tests/behaveLike/BrowserSession.spec'
import VertoHandler from '../../common/tests/webrtc/VertoHandler.spec'
import LayoutHandler from '../../common/tests/webrtc/LayoutHandler.spec'
import { Subscribe, Unsubscribe, Broadcast } from '../../common/src/messages/Verto'
import Verto from '../src/Verto'
const Connection = require('../../common/src/services/Connection')

describe('Verto', () => {
  const _buildInstance = () => {
    const instance = new Verto({ host: 'example.signalwire.com', login: 'login', password: 'password' })
    // @ts-ignore
    instance.connection = Connection.default()
    return instance
  }
  let instance = _buildInstance()

  behaveLikeBaseSession.call(this, instance)
  behaveLikeBrowserSession.call(this, instance)
  VertoHandler.call(this, instance)
  LayoutHandler.call(this, instance)

  beforeEach(() => {
    instance = _buildInstance()
    instance.subscriptions = {}
    Connection.mockSend.mockClear()
    Connection.default.mockClear()
    Connection.mockClose.mockClear()
  })

  describe('.validateOptions()', () => {
    it('should return false with invalid options', () => {
      instance.options = { host: 'example.fs.edo', project: 'project', token: 'token' }
      expect(instance.validateOptions()).toEqual(false)
    })

    it('should return true with valid options', () => {
      instance.options = { host: 'fs.example.com', login: 'login', passwd: '1234' }
      expect(instance.validateOptions()).toEqual(true)

      instance.options = { host: 'fs.example.com', login: 'login', password: '1234' }
      expect(instance.validateOptions()).toEqual(true)
    })
  })

  describe('.vertoSubscribe()', () => {
    it('should execute the proper verto.subscribe message', async () => {
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":77,"result":{"subscribedChannels":["channel-test-name"],"sessid":"sessid-xyz"}}'))
      const response = await instance.vertoSubscribe({ channels: ['channel-test-name'] })
      expect(response.subscribedChannels).toEqual(['channel-test-name'])
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      const msg = new Subscribe({ sessid: instance.sessionid, eventChannel: ['channel-test-name'] })
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
    })
  })

  describe('.vertoUnsubscribe()', () => {
    it('should execute the proper verto.unsubscribe message', async () => {
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":77,"result":{"unsubscribedChannels":["channel-test-name"],"sessid":"sessid-xyz"}}'))
      const response = await instance.vertoUnsubscribe({ channels: ['channel-test-name'] })
      expect(response.unsubscribedChannels).toEqual(['channel-test-name'])
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      const msg = new Unsubscribe({ sessid: instance.sessionid, eventChannel: ['channel-test-name'] })
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
    })
  })

  describe('.vertoBroadcast()', () => {
    it('should execute the proper verto.broadcast message', async () => {
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":77,"result":{"sessid":"sessid-xyz"}}'))
      const response = await instance.vertoBroadcast({ channel: 'channel', data: { example: 'cmd' } })
      expect(response.sessid).toEqual('sessid-xyz')
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      const msg = new Broadcast({ sessid: instance.sessionid, eventChannel: 'channel', data: { example: 'cmd' } })
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
    })
  })
})
