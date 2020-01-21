import behaveLikeBaseSession from '../../common/tests/behaveLike/BaseSession.spec'
import behaveLikeReceive from '../../common/tests/behaveLike/Receive.spec'
import behaveLikeSetup from '../../common/tests/behaveLike/Setup.spec'
import { BladeDisconnect } from '../../common/tests/behaveLike/BladeMessages.spec'
import SignalWire from '../src/SignalWire'

describe('SignalWire Web', () => {
  const instance = new SignalWire({ project: 'project', token: 'token' })
  behaveLikeBaseSession.call(this, instance)
  behaveLikeReceive.call(this, instance)
  behaveLikeSetup.call(this, instance)
  BladeDisconnect.call(this, instance)
})
