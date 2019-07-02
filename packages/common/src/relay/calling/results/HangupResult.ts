import BaseResult from './BaseResult'
import Hangup from '../components/Hangup'

export default class HangupResult extends BaseResult {
  constructor(public component: Hangup) {
    super(component)
  }
}
