import BaseAction from './BaseAction'
import Prompt from '../components/Prompt'
import PromptResult from '../results/PromptResult'

export default class PromptAction extends BaseAction {

  constructor(public component: Prompt) {
    super(component)
  }

  get result(): PromptResult {
    return new PromptResult(this.component)
  }

  stop() {
    return this.component.stop()
  }
}
