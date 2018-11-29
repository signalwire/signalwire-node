import { ISignalWireOptions } from '../interfaces'

export const validateOptions = (options: ISignalWireOptions, className: string): boolean => {
  let check: boolean = false
  if (className === 'SignalWire') {
    check = options.hasOwnProperty('project') && options.project != '' && options.hasOwnProperty('token') && options.token != ''
  } else if (className === 'Verto') {
    check = options.hasOwnProperty('login') && options.login != '' && options.hasOwnProperty('passwd') && options.passwd != ''
  }
  return options.hasOwnProperty('host') && options.host != '' && check
}

export const cleanNumber = (num: string) => {
  let tmp = num.replace(/\D/g, '')
  if (!/^1/.test(tmp)) {
    tmp = `1${tmp}`
  }
  return `+${tmp}`
}

export const objEmpty = obj => Object.keys(obj).length === 0
