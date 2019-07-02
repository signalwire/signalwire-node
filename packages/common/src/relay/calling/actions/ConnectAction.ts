import BaseAction from './BaseAction'
import Connect from '../components/Connect'

export default class ConnectAction extends BaseAction {

  constructor(public component: Connect) {
    super(component)
  }
}
