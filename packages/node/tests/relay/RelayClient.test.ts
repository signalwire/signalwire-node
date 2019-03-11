import behaveLikeBaseSession from '../../../common/tests/behaveLike/BaseSession'
import { BladeDisconnect } from '../../../common/tests/behaveLike/BladeMessages'
import RelayClient from '../../src/relay'

describe('RelayClient Node', () => {
  behaveLikeBaseSession.call(this, RelayClient)
  BladeDisconnect.call(this, RelayClient)
})
