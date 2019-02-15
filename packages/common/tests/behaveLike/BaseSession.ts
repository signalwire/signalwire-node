import { monitorCallbackQueue } from '../../src/services/Handler'
import BaseSession from '../../src/BaseSession'
// import { ISignalWireOptions } from '../../src/util/interfaces'
// const Connection = require('../../src/services/Connection')
// jest.mock('../../src/services/Connection')

export default (klass: any) => {
  describe('Inherit BaseClass', () => {
    // const OPTIONS: ISignalWireOptions = { host: 'example.signalwire.com', login: 'login', password: 'password', project: 'project', token: 'token' }
    // const instance = new klass(OPTIONS)

    // afterAll(() => {
    //   console.log('\t afterAll \n', monitorCallbackQueue(), '\n')
    // })

    // beforeEach(() => {
    //   console.log('BaseSession beforeEach?')
    // })

    // beforeAll(() => {
    //   console.log('beforeAll')
    // })

    // describe('', () => {})
    describe('public methods', () => {
      // TODO: implement all these specs
      describe('execute', () => { })
      describe('executeRaw', () => { })
      describe('on', () => { })
      describe('off', () => { })
      describe('subscribe', () => { })
      describe('unsubscribe', () => { })
      describe('broadcast', () => { })
      describe('disconnect', () => { })
    })

    describe('protected methods', () => {
      // TODO: implement all these specs
      describe('_removeSubscription()', () => { })
      describe('_addSubscription()', () => { })

      describe('_onSocketOpen()', () => { })
      describe('_onSocketClose()', () => { })
      describe('_onSocketError()', () => { })
      describe('_onSocketMessage()', () => { })
    })

    describe('private methods', () => {
      // TODO: implement all these specs
      describe('_attachListeners()', () => { })
      describe('_detachListeners()', () => { })

      describe('_emptyExecuteQueues()', () => { })
    })

    describe('static methods', () => {
      const mockFn = jest.fn()

      it('.uuid() should returns UUID v4', () => {
        const pattern = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
        expect(BaseSession.uuid()).toMatch(pattern)
      })

      it('.on() should add a listener into the internal queue', () => {
        BaseSession.on('event', mockFn)
        expect(monitorCallbackQueue()).toHaveProperty('event')
      })

      it('.off() should remove a listener from the internal queue', () => {
        BaseSession.off('event')
        expect(monitorCallbackQueue()).not.toHaveProperty('event')
      })
    })
  })
}
