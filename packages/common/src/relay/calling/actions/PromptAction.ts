import BaseAction from './BaseAction'
import Prompt from '../components/Prompt'

export default class PromptAction extends BaseAction {

  constructor(public component: Prompt) {
    super(component)
  }

  stop() {
    return this.component.stop()
  }
}
