import logger from './logger'
import { ISignalWireOptions } from '../interfaces'
import { STORAGE_PREFIX } from './constants'

export const validateOptions = (options: ISignalWireOptions, className: string): boolean => {
  let check: boolean = false
  const { host, project, token, login, passwd, password } = options
  if (className === 'SignalWire') {
    check = Boolean(project && token)
  } else if (className === 'Verto') {
    check = Boolean(login && (passwd || password))
  } else {
    return false
  }
  return Boolean(host) && check
}

export const cleanNumber = (num: string) => {
  let tmp = num.replace(/\D/g, '')
  if (!/^1/.test(tmp)) {
    tmp = `1${tmp}`
  }
  return `+${tmp}`
}

export const objEmpty = (obj: Object) => Object.keys(obj).length === 0

export const mutateStorageKey = (key: string) => `${STORAGE_PREFIX}${key}`

export const mutateLiveArrayData = (data: any) => {
  const [participantId, participantNumber, participantName, codec, mediaJson, participantData] = data
  let media = {}
  try {
    media = JSON.parse(mediaJson.replace(/ID"/g, 'Id"'))
  } catch (error) {
    logger.warn('Verto LA invalid media JSON string:', mediaJson)
  }
  return { participantId: Number(participantId), participantNumber, participantName, codec, media, participantData }
}
