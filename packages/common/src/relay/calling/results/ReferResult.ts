import { BaseResult } from './BaseResult'
import { Refer } from '../components/Refer'

export class ReferResult extends BaseResult {
  constructor(public component: Refer) {
    super(component)
  }

  get referTo(): string {
    return this.component.referTo
  }

  get referResponseCode(): string {
    return this.component.referResponseCode
  }

  get referNotifyCode(): string {
    return this.component.referNotifyCode
  }
}
