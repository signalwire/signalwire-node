import BaseResult from './BaseResult'
import Connect from '../components/Connect'
import Call from '../Call'

export default class ConnectResult extends BaseResult {
  constructor(public component: Connect) {
    super(component)
  }

  get state(): string {
    return this.component.state
  }

  get call(): Call {
    return this.component.call.peer
  }
}
