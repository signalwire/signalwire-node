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

export const objEmpty = obj => Object.keys(obj).length === 0

export const mutateStorageKey = key => `${STORAGE_PREFIX}${key}`
