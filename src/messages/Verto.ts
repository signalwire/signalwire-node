import BaseRequest from './verto/BaseRequest'
import { Login } from './verto/Login'
import { Result } from './verto/Result'

class Invite extends BaseRequest {}
class Answer extends BaseRequest {}
class Bye extends BaseRequest {}
class Modify extends BaseRequest {}
class Info extends BaseRequest {}
class Broadcast extends BaseRequest {}
class Subscribe extends BaseRequest {}
class Unsubscribe extends BaseRequest {}

export {
  Login,
  Invite,
  Answer,
  Bye,
  Modify,
  Info,
  Broadcast,
  Subscribe,
  Unsubscribe,
  Result
}
