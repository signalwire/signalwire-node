import BaseComponent from '../components/BaseComponent'

export default abstract class BaseResult {
  constructor(public component: BaseComponent) {}

  get successful(): boolean {
    return this.component.successful
  }

  get event(): any {
    return this.component.event
  }
}
