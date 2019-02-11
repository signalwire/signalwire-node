import { objEmpty } from '../util/helpers'

type QueueMap = {
  [key: string]: {
    [key: string]: Function[]
  }
}

const GLOBAL = 'GLOBAL'
const queue: QueueMap = {}

const _exists = (eventName: string, uniqueId: string) => queue.hasOwnProperty(eventName) && queue[eventName].hasOwnProperty(uniqueId)

const monitorCallbackQueue = () => queue

/**
 * Subscribes the callback to the passed eventName. Use uniqueId to render unique the event.
 */
const register = (eventName: string, callback: Function, uniqueId: string = GLOBAL) => {
  if (!queue.hasOwnProperty(eventName)) {
    queue[eventName] = {}
  }
  if (!queue[eventName].hasOwnProperty(uniqueId)) {
    queue[eventName][uniqueId] = []
  }
  queue[eventName][uniqueId].push(callback)
}

/**
 * Subscribes the callback to the passed eventName only once. Use uniqueId to render unique the event.
 */
const registerOnce = (eventName: string, callback: Function, uniqueId: string = GLOBAL) => {
  const cb = data => {
    deRegister(eventName, cb, uniqueId)
    callback(data)
  }
  return register(eventName, cb, uniqueId)
}

/**
 * Remove subscription by callback. If not callback is passed in, all subscription will be removed.
 */
const deRegister = (eventName: string, callback?: Function | null, uniqueId: string = GLOBAL) => {
  if (!_exists(eventName, uniqueId)) {
    return false
  }
  if (callback instanceof Function) {
    const index = queue[eventName][uniqueId].indexOf(callback)
    if (index >= 0) {
      queue[eventName][uniqueId].splice(index, 1)
    }
  } else {
    queue[eventName][uniqueId] = []
  }
  if (queue[eventName][uniqueId].length === 0) { // Cleanup
    delete queue[eventName][uniqueId]
    if (objEmpty(queue[eventName])) {
      delete queue[eventName]
    }
  }
  return true
}

/**
 * Trigger the eventName, passing the data to it's subscribers. Use uniqueId to identify unique events.
 */
const trigger = (eventName: string, data: any, uniqueId: string = GLOBAL, globalPropagation: boolean = true) => {
  const _propagate: boolean = globalPropagation && uniqueId !== GLOBAL
  if (!_exists(eventName, uniqueId)) {
    if (_propagate) { trigger(eventName, data) }
    return false
  }
  const len = queue[eventName][uniqueId].length
  if (!len) {
    if (_propagate) { trigger(eventName, data) }
    return false
  }
  for (let i = len - 1; i >= 0; i--) {
    queue[eventName][uniqueId][i](data)
  }
  if (_propagate) { trigger(eventName, data) }
  return true
}

/**
 * Remove all subscriptions
 */
const deRegisterAll = (eventName: string) => {
  delete queue[eventName]
}

export {
  trigger,
  register,
  registerOnce,
  deRegister,
  deRegisterAll,
  monitorCallbackQueue
}
