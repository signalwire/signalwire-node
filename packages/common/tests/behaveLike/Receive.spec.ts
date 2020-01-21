import Receive from '../../src/services/Receive'
const Connection = require('../../src/services/Connection')
jest.mock('../../src/services/Connection')

export default (instance: any) => {
  describe('Receive', () => {
    instance.connection = Connection.default()

    beforeEach(() => {
      instance.contexts = []
      Connection.mockSend.mockClear()
      Connection.mockResponse.mockReset()
    })

    describe('with success response', () => {

      beforeEach(() => {
        Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"id":"c04d725a-c8bc-4b9e-bf1e-9c05150797cc","jsonrpc":"2.0","result":{"requester_nodeid":"uuid","responder_nodeid":"uuid","result":{"code":"200","message":"Receiving all inbound related to the requested relay contexts"}}}'))
      })

      it('should register a context using a string', async done => {
        const success = await Receive(instance, 'test')
        expect(success).toEqual(true)
        expect(instance.contexts).toEqual(['test'])
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        done()
      })

      it('should register a context using an array', async done => {
        const success = await Receive(instance, ['test', 'test1'])
        expect(success).toEqual(true)
        expect(instance.contexts).toEqual(['test', 'test1'])
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        done()
      })

      it('should fail using invalid contexts', async done => {
        const success = await Receive(instance, '')
        expect(success).toEqual(false)
        expect(instance.contexts).toEqual([])
        expect(Connection.mockSend).toHaveBeenCalledTimes(0)
        // @ts-ignore
        const success2 = await Receive(instance, [null, false, '', NaN])
        expect(success2).toEqual(false)
        expect(instance.contexts).toEqual([])
        expect(Connection.mockSend).toHaveBeenCalledTimes(0)
        done()
      })

      it('should concat the contexts already registered', async done => {
        instance.contexts = ['exists']
        const success = await Receive(instance, ['home', 'office', 'exists'])
        expect(success).toEqual(true)
        expect(instance.contexts).toEqual(['exists', 'home', 'office'])
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        done()
      })
    })

    describe('with failure response', () => {

      beforeEach(() => {
        Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"req-uuid","error":{"requester_nodeid":"uuid","responder_nodeid":"uuid","code":-32601,"message":"Error message.."}}'))
      })

      it('should return false', async done => {
        const success = await Receive(instance, 'test')
        expect(success).toEqual(false)
        expect(instance.contexts).toHaveLength(0)
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
        done()
      })
    })
  })
}
