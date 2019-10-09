import RelayClient from '../../src/relay'
import { ICallDevice, IRelayCallingPlay } from '../../../common/src/util/interfaces'
import Call from '../../../common/src/relay/calling/Call'
import { Execute } from '../../../common/src/messages/Blade'
import { Play } from '../../../common/src/relay/calling/components'
import { PlayAction } from '../../../common/src/relay/calling/actions'
import { PlayPauseResult, PlayResumeResult, StopResult } from '../../../common/src/relay/calling/results'
const Connection = require('../../../common/src/services/Connection')
jest.mock('../../../common/src/services/Connection')

describe('PlayAction', () => {
  const device: ICallDevice = { type: 'phone', params: { from_number: '2345', to_number: '6789', timeout: 30 } }
  const media: IRelayCallingPlay = { type: 'audio', params: { url: 'audio.mp3' } }
  const session: RelayClient = new RelayClient({ host: 'example.signalwire.com', project: 'project', token: 'token' })
  session.__logger.setLevel(session.__logger.levels.SILENT)
  // @ts-ignore
  session.connection = Connection.default()
  session.relayProtocol = 'signalwire_service_random_uuid'

  const call = new Call(session.calling, { device })
  call.id = 'call-id'
  call.nodeId = 'node-id'
  const component = new Play(call, [media])
  let action: PlayAction = null

  const _mockReturnSuccess = () => Connection.mockResponse.mockReturnValueOnce(JSON.parse('{"id":"uuid","jsonrpc":"2.0","result":{"result":{"code":"200","message":"message","control_id":"control-id"}}}'))
  const _mockReturnFail = () => Connection.mockResponse.mockReturnValueOnce(JSON.parse('{"id":"uuid","jsonrpc":"2.0","result":{"result":{"code":"400","message":"error message","control_id":"control-id"}}}'))
  beforeEach(() => {
    Connection.mockSend.mockClear()
    action = new PlayAction(component)
  })

  describe('stop', () => {
    const stopMessage = new Execute({
      protocol: 'signalwire_service_random_uuid',
      method: 'calling.play.stop',
      params: { node_id: 'node-id', call_id: 'call-id', control_id: 'mocked-uuid' }
    })

    it('should execute the proper method and return the result', async done => {
      _mockReturnSuccess()

      const result = await action.stop()
      expect(Connection.mockSend).nthCalledWith(1, stopMessage)
      expect(result).toBeInstanceOf(StopResult)
      expect(result.successful).toBe(true)
      done()
    })
  })

  describe('pause', () => {
    const pauseMessage = new Execute({
      protocol: 'signalwire_service_random_uuid',
      method: 'calling.play.pause',
      params: { node_id: 'node-id', call_id: 'call-id', control_id: 'mocked-uuid' }
    })

    it('with success response should return a PlayResumeResult object with successful true', async done => {
      _mockReturnSuccess()

      const result = await action.pause()
      expect(Connection.mockSend).nthCalledWith(1, pauseMessage)
      expect(result).toBeInstanceOf(PlayPauseResult)
      expect(result.successful).toBe(true)
      done()
    })

    it('with success response should return a PlayResumeResult object with successful false', async done => {
      _mockReturnFail()

      const result = await action.pause()
      expect(Connection.mockSend).nthCalledWith(1, pauseMessage)
      expect(result).toBeInstanceOf(PlayPauseResult)
      expect(result.successful).toBe(false)
      done()
    })
  })

  describe('resume', () => {
    const resumeMessage = new Execute({
      protocol: 'signalwire_service_random_uuid',
      method: 'calling.play.resume',
      params: { node_id: 'node-id', call_id: 'call-id', control_id: 'mocked-uuid' }
    })

    it('with success response should return a PlayResumeResult object with successful true', async done => {
      _mockReturnSuccess()

      const result = await action.resume()
      expect(Connection.mockSend).nthCalledWith(1, resumeMessage)
      expect(result).toBeInstanceOf(PlayResumeResult)
      expect(result.successful).toBe(true)
      done()
    })

    it('with success response should return a PlayResumeResult object with successful false', async done => {
      _mockReturnFail()

      const result = await action.resume()
      expect(Connection.mockSend).nthCalledWith(1, resumeMessage)
      expect(result).toBeInstanceOf(PlayResumeResult)
      expect(result.successful).toBe(false)
      done()
    })
  })
})
