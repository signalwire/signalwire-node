import { v4 as uuidv4 } from 'uuid'

export default class Blocker {

  public controlId: string
  public promise: Promise<any>
  public resolve: Function
  public reject: Function

  constructor(public eventType: string, public resolver: Function) {
    this.controlId = uuidv4()

    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
}
