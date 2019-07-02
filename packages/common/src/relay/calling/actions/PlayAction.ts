import BaseAction from './BaseAction'
import Play from '../components/Play'

export default class PlayAction extends BaseAction {

  constructor(public component: Play) {
    super(component)
  }

  stop() {
    return this.component.stop()
  }
}
