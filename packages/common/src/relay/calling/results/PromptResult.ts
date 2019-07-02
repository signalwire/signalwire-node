import BaseResult from './BaseResult'
import Prompt from '../components/Prompt'

export default class PromptResult extends BaseResult {
  constructor(public component: Prompt) {
    super(component)
  }
}
