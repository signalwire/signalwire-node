import BaseComponent from '../components/BaseComponent'

export default abstract class BaseAction {
  constructor(public component: BaseComponent) {}

  get controlId(): string {
    return this.component.controlId
  }

  get payload(): any {
    return this.component.payload
  }

  get completed(): boolean {
    return this.component.completed
  }

  get state(): string {
    return this.component.state
  }

  get result(): any {
    return this.component.result
  }
}
