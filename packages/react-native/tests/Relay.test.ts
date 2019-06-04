import behaveLikeBaseSession from '../../common/tests/behaveLike/BaseSession'
import { BladeDisconnect } from '../../common/tests/behaveLike/BladeMessages'
import Relay from '../src/Relay'

describe('Relay React Native', () => {
  const instance = new Relay({ host: 'example.signalwire.com', project: 'project', token: 'token' })
  behaveLikeBaseSession.call(this, instance)
  BladeDisconnect.call(this, instance)
})
