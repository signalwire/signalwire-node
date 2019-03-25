import behaveLikeBaseSession from '../../common/tests/behaveLike/BaseSession'
import { BladeDisconnect } from '../../common/tests/behaveLike/BladeMessages'
import Relay from '../src/Relay'

describe('Relay React Native', () => {
  behaveLikeBaseSession.call(this, Relay)
  BladeDisconnect.call(this, Relay)
})
