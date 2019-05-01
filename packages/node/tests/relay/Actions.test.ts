import Call from '../../../common/src/relay/calling/Call'
import { Execute } from '../../../common/src/messages/Blade'
import * as Actions from '../../../common/src/relay/calling/Actions'
import RelayClient from '../../src/relay'

const Connection = require('../../../common/src/services/Connection')

describe('Calling', () => {
  const _mockConnection = () => {
    Connection.mockResponse
      .mockReturnValueOnce(JSON.parse('{"id":"c04d725a-c8bc-4b9e-bf1e-9c05150797cc","jsonrpc":"2.0","result":{"requester_nodeid":"05b1114c-XXXX-YYYY-ZZZZ-feaa30afad6c","responder_nodeid":"9811eb32-XXXX-YYYY-ZZZZ-ab56fa3b83c9","result":{"protocol":"signalwire_service_random_uuid"}}}'))
      .mockReturnValueOnce(JSON.parse('{"id":"24f9b545-8bed-49e1-8214-5dbadb545f7d","jsonrpc":"2.0","result":{"command":"add","failed_channels":[],"protocol":"signalwire_service_random_uuid","subscribe_channels":["notifications"]}}'))
  }
  let session: RelayClient = null
  let call: Call = null

  beforeAll(async done => {
    session = new RelayClient({ host: 'example.signalwire.com', project: 'project', token: 'token' })
    await session.connect()
    _mockConnection()
    call = await session.calling.newCall({ type: 'phone', from: '234', to: '567' })
    call.id = 'call-id'
    call.nodeId = 'node-id'
    done()
  })

  beforeEach(() => {
    Connection.mockSend.mockClear()
  })

  describe('PlayMediaAction', () => {
    it('should stop the current media in play', async done => {
      const action = new Actions.PlayMediaAction(call, 'control-id')
      await action.stop()
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.play.stop',
        params: {
          node_id: 'node-id',
          call_id: 'call-id',
          control_id: 'control-id'
        }
      })
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
      done()
    })
  })

  describe('PlayAudioAction', () => {
    it('should stop the current media in play', async done => {
      const action = new Actions.PlayAudioAction(call, 'control-id')
      await action.stop()
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.play.stop',
        params: {
          node_id: 'node-id',
          call_id: 'call-id',
          control_id: 'control-id'
        }
      })
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
      done()
    })
  })

  describe('PlaySilenceAction', () => {
    it('should stop the current media in play', async done => {
      const action = new Actions.PlaySilenceAction(call, 'control-id')
      await action.stop()
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.play.stop',
        params: {
          node_id: 'node-id',
          call_id: 'call-id',
          control_id: 'control-id'
        }
      })
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
      done()
    })
  })

  describe('PlayTTSAction', () => {
    it('should stop the current media in play', async done => {
      const action = new Actions.PlayTTSAction(call, 'control-id')
      await action.stop()
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.play.stop',
        params: {
          node_id: 'node-id',
          call_id: 'call-id',
          control_id: 'control-id'
        }
      })
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
      done()
    })
  })


  describe('PlayMediaAndCollectAction', () => {
    it('should stop the current media in play', async done => {
      const action = new Actions.PlayMediaAndCollectAction(call, 'control-id')
      await action.stop()
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.play_and_collect.stop',
        params: {
          node_id: 'node-id',
          call_id: 'call-id',
          control_id: 'control-id'
        }
      })
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
      done()
    })
  })

  describe('PlayAudioAndCollectAction', () => {
    it('should stop the current media in play', async done => {
      const action = new Actions.PlayAudioAndCollectAction(call, 'control-id')
      await action.stop()
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.play_and_collect.stop',
        params: {
          node_id: 'node-id',
          call_id: 'call-id',
          control_id: 'control-id'
        }
      })
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
      done()
    })
  })

  describe('PlaySilenceAndCollectAction', () => {
    it('should stop the current media in play', async done => {
      const action = new Actions.PlaySilenceAndCollectAction(call, 'control-id')
      await action.stop()
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.play_and_collect.stop',
        params: {
          node_id: 'node-id',
          call_id: 'call-id',
          control_id: 'control-id'
        }
      })
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
      done()
    })
  })

  describe('PlayTTSAndCollectAction', () => {
    it('should stop the current media in play', async done => {
      const action = new Actions.PlayTTSAndCollectAction(call, 'control-id')
      await action.stop()
      const msg = new Execute({
        protocol: 'signalwire_service_random_uuid',
        method: 'call.play_and_collect.stop',
        params: {
          node_id: 'node-id',
          call_id: 'call-id',
          control_id: 'control-id'
        }
      })
      expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      expect(Connection.mockSend).toHaveBeenCalledWith(msg)
      done()
    })
  })
})
