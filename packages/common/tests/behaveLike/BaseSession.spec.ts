import { isQueued } from '../../src/services/Handler'
const Connection = require('../../src/services/Connection')

export default (instance: any) => {
  describe('Inherit BaseClass', () => {
    beforeEach(() => {
      instance._idle = false
      instance._executeQueue = []
      instance.subscriptions = new Map()
      Connection.mockSend.mockClear()
      Connection.mockSendRawText.mockClear()
      Connection.mockClose.mockClear()
    })

    describe('public methods', () => {
      describe('execute', () => {
        const payload = { request: { fake: 'data' } }

        it('should send the message through the socket if the connection is live', async done => {
          const response = await instance.execute(payload)
          expect(Connection.mockSend).toHaveBeenLastCalledWith(payload)
          expect(response).toEqual({ message: 'fake' })
          done()
        })

        it('should queue the message if the connection went down', async done => {
          await instance.disconnect()
          instance.execute(payload)
            .then(response => {
              expect(instance.connected).toEqual(true)
              expect(response).toEqual({ message: 'fake' })
              done()
            })
          expect(Connection.mockSend).not.toHaveBeenCalled()
          expect(instance._executeQueue).toHaveLength(1)
          await instance.connect()
          instance._idle = false
          instance._emptyExecuteQueues()
        })

        it('should queue the message if the connection is idle', async done => {
          instance._idle = true
          instance.execute(payload).then(response => {
            expect(response).toEqual({ message: 'fake' })
            done()
          })
          expect(Connection.mockSend).not.toHaveBeenCalled()
          expect(instance._executeQueue).toHaveLength(1)
          /** Reproduce/Mock a reconnection to validate the execute Promise */
          await instance.connect()
          instance._idle = false
          instance._emptyExecuteQueues()
        })
      })

      describe('executeRaw', () => {
        const payload = '#TEST'
        it('should send the message through the socket if the connection is live', async done => {
          await instance.connect()
          instance.executeRaw(payload)
          expect(Connection.mockSendRawText).toHaveBeenLastCalledWith(payload)
          done()
        })

        it('should NOT send the message through the socket if the connection is idle', () => {
          instance._idle = true
          instance.executeRaw(payload)
          expect(Connection.mockSendRawText).not.toHaveBeenCalled()
          expect(instance._executeQueue).toHaveLength(1)
          expect(instance._executeQueue[0].msg).toEqual(payload)
        })
      })

      describe('on', () => { })
      describe('off', () => { })
      describe('subscribe', () => { })
      describe('unsubscribe', () => { })
      describe('broadcast', () => { })

      describe('.connect()', () => {
        it('should register socket listeners', () => {
          const listeners = ['signalwire.socket.close', 'signalwire.socket.open', 'signalwire.socket.error', 'signalwire.socket.message']
          listeners.forEach(event => {
            expect(isQueued(event, instance.uuid)).toEqual(true)
          })
        })

        describe('with an already established connection', () => {
          it('should do nothing', async done => {
            await instance.connect()
            expect(Connection.mockClose).not.toHaveBeenCalled()
            done()
          })
        })

        describe('with an invalid connection (closed/closing state)', () => {
          it('should close the previous one and create another', async done => {
            Connection.mockConnect.mockClear()
            Connection.isAlive.mockReturnValueOnce(false)
            await instance.connect()
            expect(Connection.mockConnect).toHaveBeenCalledTimes(1)
            done()
          })
        })
      })

      describe('.disconnect()', () => {
        it('should close the connection', async done => {
          await instance.disconnect()
          expect(Connection.mockClose).toHaveBeenCalled()
          expect(instance.calls || {}).toMatchObject({})
          expect(instance.subscriptions).toMatchObject({})
          expect(instance.contexts).toMatchObject([])
          done()
        })
      })
    })
  })
}
