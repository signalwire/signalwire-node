import BaseResult from './BaseResult'
import Detect from '../components/Detect'

export default class DetectResult extends BaseResult {
  constructor(public component: Detect) {
    super(component)
  }

  get type(): string {
    return this.component.type
  }

  get result(): string {
    return this.component.result
  }
}
