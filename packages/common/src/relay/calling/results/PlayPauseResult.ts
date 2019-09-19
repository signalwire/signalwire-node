import { BaseResult } from './BaseResult'
import { Play } from '../components/Play'

export class PlayPauseResult extends BaseResult {
  constructor(public component: Play) {
    super(component)
  }
}
