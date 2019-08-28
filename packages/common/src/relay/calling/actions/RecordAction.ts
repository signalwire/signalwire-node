import { BaseAction } from './BaseAction'
import { Record } from '../components/Record'
import { RecordResult } from '../results/RecordResult'

export class RecordAction extends BaseAction {

  constructor(public component: Record) {
    super(component)
  }

  get result(): RecordResult {
    return new RecordResult(this.component)
  }

  stop() {
    return this.component.stop()
  }
}
