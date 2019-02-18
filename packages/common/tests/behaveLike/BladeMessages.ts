import { trigger } from '../../src/services/Handler'
import { SwEvent } from '../../src/util/constants'

/**
 * Module to test "blade.xxx" messages in both browser/node following DRY principle.
 */

const BladeDisconnect = (klass: any) => {
  describe('blade.disconnect', () => {
    let instance: any
    beforeAll(async done => {
      instance = new klass({ host: 'example.signalwire.com', project: 'project', token: 'token' })
      await instance.connect()
      done()
    })

    it('should put the session in a idle state', () => {
      const msg = JSON.parse('{"id":"378d7dea-e581-4305-a7e7-d29173797f32","jsonrpc":"2.0","method":"blade.disconnect"}')
      trigger(SwEvent.SocketMessage, msg, instance.uuid)
      // @ts-ignore
      expect(instance._idle).toEqual(true)
    })
  })
}

export {
  BladeDisconnect
}
