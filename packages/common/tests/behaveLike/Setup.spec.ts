import Setup from '../../src/services/Setup'
const Connection = require('../../src/services/Connection')
jest.mock('../../src/services/Connection')

export default (instance: any) => {
  describe('Setup', () => {
    instance.connection = Connection.default()

    beforeEach(() => {
      Connection.mockSend.mockClear()
      Connection.mockResponse
        .mockImplementationOnce(() => JSON.parse('{"id":"c04d725a-c8bc-4b9e-bf1e-9c05150797cc","jsonrpc":"2.0","result":{"requester_nodeid":"05b1114c-XXXX-YYYY-ZZZZ-feaa30afad6c","responder_nodeid":"9811eb32-XXXX-YYYY-ZZZZ-ab56fa3b83c9","result":{"protocol":"signalwire_service_random_uuid"}}}'))
        .mockImplementationOnce(() => JSON.parse('{"id":"24f9b545-8bed-49e1-8214-5dbadb545f7d","jsonrpc":"2.0","result":{"command":"add","failed_channels":[],"protocol":"signalwire_service_random_uuid","subscribe_channels":["notifications"]}}'))
    })

    it('should setup a new protocol', async () => {
      instance.connection = Connection.default()
      const protocol = await Setup(instance)
      expect(protocol).toEqual('signalwire_service_random_uuid')
      expect(instance.subscriptions).toHaveProperty(protocol)
      expect(Connection.mockSend).toHaveBeenCalledTimes(2)
    })
  })
}
