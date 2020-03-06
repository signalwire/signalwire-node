import behaveLikeBaseSession from '../../../common/tests/behaveLike/BaseSession.spec'
import behaveLikeReceive from '../../../common/tests/behaveLike/Receive.spec'
import behaveLikeSetup from '../../../common/tests/behaveLike/Setup.spec'
import { BladeDisconnect } from '../../../common/tests/behaveLike/BladeMessages.spec'
import RelayClient from '../../src/relay'
import { Connect } from '../../../common/src/messages/Blade'
const Connection = require('../../../common/src/services/Connection')

describe('RelayClient Node', () => {
  const clientOptions = { project: 'project', token: 'token' }
  const _buildInstance = (): RelayClient => {
    const instance = new RelayClient(clientOptions)
    // @ts-ignore
    instance.connection = Connection.default()
    return instance
  }
  let instance: RelayClient = null

  behaveLikeBaseSession(_buildInstance())
  behaveLikeReceive(_buildInstance())
  behaveLikeSetup(_buildInstance())
  BladeDisconnect(_buildInstance())

  beforeEach(() => {
    instance = _buildInstance()
    instance.off('signalwire.ready')
    Connection.mockSend.mockClear()
    Connection.default.mockClear()
    Connection.mockClose.mockClear()
  })

  afterEach(() => {
    process.removeAllListeners()
  })

  describe('_onSocketOpen()', () => {
    it('should send a blade.connect, execute setup and set signature and sessionid', async done => {
      Connection.mockResponse
        .mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"uuid","result":{"session_restored":false,"sessionid":"bfb34f66-3caf-45a9-8a4b-a74bbd3d0b28","nodeid":"uuid","master_nodeid":"uuid","authorization":{"project":"uuid","expires_at":null,"scopes":["calling","messaging","tasking"],"signature":"uuid-signature"},"routes":[],"protocols":[],"subscriptions":[],"authorities":[],"authorizations":[],"accesses":[],"protocols_uncertified":["signalwire"]}}'))
        .mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"uuid","result":{"requester_nodeid":"uuid","responder_nodeid":"uuid","result":{"protocol":"signalwire_service_random_uuid"}}}'))
        .mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"uuid","result":{"command":"add","failed_channels":[],"protocol":"signalwire_service_random_uuid","subscribe_channels":["notifications"]}}'))

      const onNotification = jest.fn()
      instance.on('signalwire.ready', onNotification)
      // @ts-ignore
      await instance._onSocketOpen()

      const msg = new Connect({ project: 'project', token: 'token' })
      expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      expect(instance.sessionid).toEqual('bfb34f66-3caf-45a9-8a4b-a74bbd3d0b28')
      expect(instance.signature).toEqual('uuid-signature')
      expect(instance.relayProtocol).toEqual('signalwire_service_random_uuid')
      expect(instance.expiresAt).toEqual(0)
      expect(onNotification).toHaveBeenCalledTimes(1)
      // @ts-ignore
      expect(instance._idle).toEqual(false)
      // @ts-ignore
      expect(instance._autoReconnect).toEqual(true)
      done()
    })

    it('in case of Timeout on blade.connect it should close the connection and attempt to reconnect', async done => {
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"uuid","error":{"code":-32000,"message":"Timeout"}}'))

      const onNotification = jest.fn()
      instance.on('signalwire.ready', onNotification)
      // @ts-ignore
      await instance._onSocketOpen()

      const msg = new Connect({ project: 'project', token: 'token' })
      expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      expect(Connection.mockClose).toHaveBeenCalledTimes(1)
      expect(onNotification).toHaveBeenCalledTimes(0)
      // @ts-ignore
      expect(instance._idle).toEqual(true)
      // @ts-ignore
      expect(instance._autoReconnect).toEqual(true)
      done()
    })
  })

  describe('_onSocketClose()', () => { })
  describe('_onSocketError()', () => { })
  describe('_onSocketMessage()', () => { })
})
