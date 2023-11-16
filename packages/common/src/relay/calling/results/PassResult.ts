import { BaseResult } from './BaseResult'
import { Pass } from '../components/Pass'

export class PassResult extends BaseResult {
  constructor(public component: Pass) {
    super(component)
  }
}
