import BaseResult from './BaseResult'
import Record from '../components/Record'

export default class RecordResult extends BaseResult {
  constructor(public component: Record) {
    super(component)
  }
}
