import BaseResult from './BaseResult'
import Dial from '../components/Dial'

export default class DialResult extends BaseResult {
  constructor(public component: Dial) {
    super(component)
  }
}
