import { BaseAction } from './BaseAction'
import { Refer } from '../components/Refer'
import { ReferResult } from '../results/ReferResult'

export class ReferAction extends BaseAction {

  constructor(public component: Refer) {
    super(component)
  }

  get result(): ReferResult {
    return new ReferResult(this.component)
  }
}
