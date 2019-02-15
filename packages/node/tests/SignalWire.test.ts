import behaveLikeBaseSession from '../../common/tests/behaveLike/BaseSession'
// import { ISignalWireOptions } from '../../src/util/interfaces'
import SignalWire from '../src/SignalWire'
import { trigger } from '../../common/src/services/Handler';
import { SwEvent } from '../../common/src/util/constants';

const Connection = require('../../common/src/services/Connection')
jest.mock('../../common/src/services/Connection')

describe('SignalWire Node', () => {
  behaveLikeBaseSession.call(this, SignalWire)

  describe('blade.disconnect', () => {
    let instance: SignalWire
    beforeAll(async done => {
      console.log('beforeAll')
      instance = new SignalWire({ host: 'example.signalwire.com', project: 'project', token: 'token' })
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
})
