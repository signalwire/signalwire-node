import { BaseAction } from './BaseAction'
import { Play } from '../components/Play'
import { PlayResult } from '../results/PlayResult'

export class PlayAction extends BaseAction {

  constructor(public component: Play) {
    super(component)
  }

  get result(): PlayResult {
    return new PlayResult(this.component)
  }

  stop() {
    return this.component.stop()
  }
}
