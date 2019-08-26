import BaseResult from './BaseResult'
import SendDigits from '../components/SendDigits'

export default class SendDigitsResult extends BaseResult {
  constructor(public component: SendDigits) {
    super(component)
  }
}
