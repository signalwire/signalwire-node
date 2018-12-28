import Verto from '../src/Verto'
import { monitorCallbackQueue } from '../src/services/Handler'
const Connection = require('../src/Connection')
jest.mock('../src/Connection')

describe('Verto', () => {
  let instance: Verto
  const noop = (): void => { }

  beforeEach(() => {
    Connection.mockSend.mockClear()
    Connection.default.mockClear()
    instance = new Verto({ host: 'example.fs.edo', login: 'login', passwd: 'passwd' })
    instance.subscriptions = {}
    instance.connect()
  })

  it('should instantiate Verto with default methods', () => {
    expect(instance).toBeInstanceOf(Verto)
  })

  describe('.connect()', () => {
    it('should instantiate its own connection', () => {
      expect(Connection.default).toHaveBeenCalledTimes(1)
    })

    it('should register sockets listeners', () => {
      const queue = monitorCallbackQueue()
      expect(Object.keys(queue).sort()).toEqual(['signalwire.socket.close', 'signalwire.socket.open', 'signalwire.socket.error', 'signalwire.socket.message'].sort())
    })
  })

  describe('.subscribe()', () => {
    it('should add the subscription and return the response', async () => {
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":77,"result":{"subscribedChannels":["channel-test-name"],"sessid":"sessid-xyz"}}'))
      const response = await instance.subscribe({ channels: ['channel-test-name'], handler: noop })
      expect(response).toHaveProperty('subscribedChannels')
      expect(response.subscribedChannels).toEqual(['channel-test-name'])
      expect(Connection.mockSend.mock.calls).toHaveLength(1)
      expect(instance.subscriptions).toHaveProperty('channel-test-name')
    })

    it('should do nothing if subscription already exists and return NULL', async () => {
      instance.subscriptions = { 'channel-already-there': {} }
      const response = await instance.subscribe({ channels: ['channel-already-there'], handler: noop })
      expect(response).toBeUndefined()
      expect(Connection.mockSend.mock.calls).toHaveLength(0)
      expect(instance.subscriptions).toHaveProperty('channel-already-there')
    })

    it('should not add the subscription to an invalid channel but return the response', async () => {
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":77,"result":{"unauthorizedChannels":["channel-invalid"],"sessid":"sessid-xyz"}}'))
      const response = await instance.subscribe({ channels: ['channel-invalid'], handler: noop })
      expect(response).toHaveProperty('unauthorizedChannels')
      expect(Connection.mockSend.mock.calls).toHaveLength(1)
      expect(instance.subscriptions).not.toHaveProperty('channel-invalid')
    })
  })

  describe('.unsubscribe()', () => {
    it('should remove the subscription and return the response', async () => {
      const cName = 'channel-already-there'
      instance.subscriptions = { [cName]: {} }
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse(`{"jsonrpc":"2.0","id":77,"result":{"unsubscribedChannels":["${cName}"],"sessid":"sessid-xyz"}}`))
      const response = await instance.unsubscribe({ channels: [cName] })
      expect(response).toHaveProperty('unsubscribedChannels')
      expect(response.unsubscribedChannels).toEqual([cName])
      expect(instance.subscriptions).not.toHaveProperty(cName)
    })

    it('should do nothing if subscription does not exists', async () => {
      const cName = 'channel-fake'
      const response = await instance.unsubscribe({ channels: [cName] })
      expect(response).toBeUndefined()
      expect(instance.subscriptions).not.toHaveProperty(cName)
    })
  })

  describe('.broadcast()', () => {
    it('should broadcast the message with valid params', () => {
      const cName = 'bd-channel'
      instance.subscriptions = { [cName]: {} }
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse(`{"jsonrpc":"2.0","id":77,"result":{"unsubscribedChannels":["${cName}"],"sessid":"sessid-xyz"}}`))
      const response = instance.broadcast({ channel: cName, data: { text: 'msg' } })
      expect(response).toBeUndefined()
      const { request } = Connection.mockSend.mock.calls[0][0]
      expect(request.params).toMatchObject({ sessid: '', eventChannel: cName, data: { text: 'msg' } })
    })

    it('should thrown an error with invalid params', () => {
      expect(instance.broadcast.bind(instance, { channel: '' })).toThrow()
      expect(instance.broadcast.bind(instance, { channel: false })).toThrow()
      expect(instance.broadcast.bind(instance, { channel: null })).toThrow()
    })
  })
})
