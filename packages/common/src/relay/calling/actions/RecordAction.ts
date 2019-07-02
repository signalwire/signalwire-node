import BaseAction from './BaseAction'
import Record from '../components/Record'

export default class RecordAction extends BaseAction {

  constructor(public component: Record) {
    super(component)
  }

  stop() {
    return this.component.stop()
  }
}
