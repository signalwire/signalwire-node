import BaseRequest from './verto/BaseRequest'
import { Login } from './verto/Login'
import { Result } from './verto/Result'

class Invite extends BaseRequest {
  toString() {
    return 'invite'
  }
}
class Answer extends BaseRequest {
  toString() {
    return 'answer'
  }
}
class Attach extends BaseRequest {
  toString() {
    return 'attach'
  }
}
class Bye extends BaseRequest {
  toString() {
    return 'bye'
  }
}
class Modify extends BaseRequest {
  toString() {
    return 'modify'
  }
}
class Info extends BaseRequest {
  toString() {
    return 'info'
  }
}
class Broadcast extends BaseRequest {
  toString() {
    return 'broadcast'
  }
}
class Subscribe extends BaseRequest {
  toString() {
    return 'subscribe'
  }
}
class Unsubscribe extends BaseRequest {
  toString() {
    return 'unsubscribe'
  }
}

export {
  Login,
  Invite,
  Answer,
  Attach,
  Bye,
  Modify,
  Info,
  Broadcast,
  Subscribe,
  Unsubscribe,
  Result
}
