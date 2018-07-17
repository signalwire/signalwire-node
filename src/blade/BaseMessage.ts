import uuidv4 from 'uuid/v4'

abstract class BaseMessage {
  private _baseProperties: { jsonrpc: string, id: string } = {
    jsonrpc: '2.0',
    id: uuidv4()
  }
  protected method: string

  public request: any
  public response: any

  buildRequest(params: any) {
    this.request = { ...this._baseProperties, ...params }
  }

  buildResponse(response: any) {
    this.response = response
  }
}

export default BaseMessage