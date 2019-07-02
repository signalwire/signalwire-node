import BaseResult from './BaseResult'
import Connect from '../components/Connect'

export default class ConnectResult extends BaseResult {
  constructor(public component: Connect) {
    super(component)
  }
}
