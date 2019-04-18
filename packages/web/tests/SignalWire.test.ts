import behaveLikeBaseSession from '../../common/tests/behaveLike/BaseSession'
import { BladeDisconnect } from '../../common/tests/behaveLike/BladeMessages'
import SignalWire from '../src/SignalWire'

describe('SignalWire Web', () => {
  const instance = new SignalWire({ host: 'example.signalwire.com', project: 'project', token: 'token', domain: 'domain', resource: 'resource' })
  behaveLikeBaseSession.call(this, instance)
  BladeDisconnect.call(this, instance)
})
