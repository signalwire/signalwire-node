import BaseMessage from '../BaseMessage'

export default abstract class BaseRequest extends BaseMessage {
  method: string = `verto.${this.constructor.name.toLowerCase()}`

  constructor(params: any = {}) {
    super()

    if (params.hasOwnProperty('dialogParams')) {
      // Filter dialogParams using rest operator
      const { remoteSdp, withAudio, withVideo, ...dialogParams } = params.dialogParams
      params.dialogParams = dialogParams
    }

    this.buildRequest({ method: this.method, params })
  }
}
