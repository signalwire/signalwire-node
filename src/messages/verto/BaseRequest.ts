import BaseMessage from '../BaseMessage'

const tmpMap = {
  id: 'callID',
  destinationNumber: 'destination_number',
  remoteCallerName: 'remote_caller_id_name',
  remoteCallerNumber: 'remote_caller_id_number',
  callerName: 'caller_id_name',
  callerNumber: 'caller_id_number'
}

export default abstract class BaseRequest extends BaseMessage {
  method: string = `verto.${this.constructor.name.toLowerCase()}`

  constructor(params: any = {}) {
    super()

    if (params.hasOwnProperty('dialogParams')) {
      // Filter dialogParams using rest operator
      const { remoteSdp, localStream, remoteStream, onNotification, ...dialogParams } = params.dialogParams

      for (const key in tmpMap) {
        if (key && dialogParams.hasOwnProperty(key)) {
          dialogParams[tmpMap[key]] = dialogParams[key]
          delete dialogParams[key]
        }
      }

      params.dialogParams = dialogParams
    }

    this.buildRequest({ method: this.method, params })
  }
}
