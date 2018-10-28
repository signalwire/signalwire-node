import PubSub from 'pubsub-js'
import { EVENTS } from './constants'
import { ISignalWireOptions } from '../interfaces'

export const registerHandler = (eventName: string, callback: any, uniqueId: string = '') => {
  const found = Object.values(EVENTS).find(v => v === eventName)
  if (!found) {
    throw new Error('Invalid event name: ' + eventName)
  }
  PubSub.subscribe(`${uniqueId}${eventName}`, callback)
}

export const removeHandler = (eventName: string, uniqueId: string = '') => PubSub.unsubscribe(`${uniqueId}${eventName}`)

export const validateOptions = (options: ISignalWireOptions): boolean => {
  return (options.hasOwnProperty('host') && options.host != '' &&
    options.hasOwnProperty('project') && options.project != '' &&
    options.hasOwnProperty('token') && options.token != '')
}

export const cleanNumber = (num: string) => {
  let tmp = num.replace(/\D/g, '')
  if (!/^1/.test(tmp)) {
    tmp = `1${tmp}`
  }
  return `+${tmp}`
}
