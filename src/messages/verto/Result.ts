import BaseMessage from '../BaseMessage'

class Result extends BaseMessage {
  constructor(id: number, method: string) {
    super()
    this.buildRequest({ id, result: { method } })
  }
}

export { Result }
