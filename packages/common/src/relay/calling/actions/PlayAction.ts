import { BaseAction } from './BaseAction'
import { Play } from '../components/Play'
import { PlayResult, PlayPauseResult, PlayResumeResult } from '../results'

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

  pause() {
    return this.component.pause(PlayPauseResult)
  }

  resume() {
    return this.component.resume(PlayResumeResult)
  }
}
