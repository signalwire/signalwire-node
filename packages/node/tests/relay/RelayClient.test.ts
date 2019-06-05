import behaveLikeBaseSession from '../../../common/tests/behaveLike/BaseSession'
import { BladeDisconnect } from '../../../common/tests/behaveLike/BladeMessages'
import RelayClient from '../../src/relay'

describe('RelayClient Node', () => {
  const instance = new RelayClient({ host: 'example.signalwire.com', project: 'project', token: 'token' })
  behaveLikeBaseSession.call(this, instance)
  BladeDisconnect.call(this, instance)
})
