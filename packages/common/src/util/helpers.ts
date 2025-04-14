import logger from './logger'
import {STORAGE_PREFIX} from './constants'

// hack to remove undefined values from the object
export const deepCopy = (obj: Object) => JSON.parse(JSON.stringify(obj))

export const objEmpty = (obj: Object) => Object.keys(obj).length === 0

export const mutateStorageKey = (key: string) => `${STORAGE_PREFIX}${key}`

export const mutateLiveArrayData = (data: any) => {
  const [
    participantId,
    participantNumber,
    participantName,
    codec,
    mediaJson,
    participantData,
  ] = data
  let media = {}
  try {
    media = JSON.parse(mediaJson.replace(/ID"/g, 'Id"'))
  } catch (error) {
    logger.warn('Verto LA invalid media JSON string:', mediaJson)
  }
  return {
    participantId: Number(participantId),
    participantNumber,
    participantName,
    codec,
    media,
    participantData,
  }
}

export const safeParseJson = (value: string): string | Object => {
  if (typeof value !== 'string') {
    return value
  }
  try {
    return JSON.parse(value)
  } catch (error) {
    return value
  }
}

export const isDefined = (variable: any): boolean =>
  typeof variable !== 'undefined'

export const isFunction = (variable: any): boolean =>
  variable instanceof Function || typeof variable === 'function'

export const findElementByType = (
  tag: HTMLMediaElement | string | Function,
): HTMLMediaElement => {
  if (typeof document !== 'object' || !('getElementById' in document)) {
    return null
  }
  if (typeof tag === 'string') {
    return <HTMLMediaElement>document.getElementById(tag) || null
  } else if (typeof tag === 'function') {
    return tag()
  } else if (tag instanceof HTMLMediaElement) {
    return tag
  }
  return null
}

const PROTOCOL_PATTERN = /^(ws|wss):\/\//
export const checkWebSocketHost = (host: string): string => {
  const protocol = PROTOCOL_PATTERN.test(host) ? '' : 'wss://'
  return `${protocol}${host}`
}

/**
 * From the socket we can get:
 * - JSON-RPC msg with 1 level of 'result' or 'error'
 * - JSON-RPC msg with 2 nested 'result' and 'code' property to identify error
 * - JSON-RPC msg with 3 nested 'result' where the third level is the Verto JSON-RPC flat msg.
 *
 * @returns Object with error | result key to identify success or fail
 */
export const destructResponse = (
  response: any,
  nodeId: string = null,
): {[key: string]: any} => {
  const {result = {}, error} = response
  if (error) {
    return {error}
  }
  const {result: nestedResult = null} = result
  if (nestedResult === null) {
    if (nodeId !== null) {
      result.node_id = nodeId
    }
    return {result}
  }
  const {code = null, node_id = null, result: vertoResult = null} = nestedResult
  if (code && code !== '200') {
    return {error: nestedResult}
  }
  if (vertoResult) {
    return destructResponse(vertoResult, node_id)
  }
  return {result: nestedResult}
}

export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const adaptToAsyncAPI = <T extends object>(
  target: T,
  toAsyncMethods: string[] = [],
) => {
  const promisify = new Set(toAsyncMethods)

  return new Proxy(target, {
    get(obj, prop) {
      const descriptor = Object.getOwnPropertyDescriptor(obj, prop)
      if (descriptor && descriptor.get) {
        return Reflect.get(obj, prop)
      }
      if (typeof obj[prop] === 'function') {
        const impl = obj[`${String(prop)}Async`] || obj[prop]

        return (...args) => {
          const result = impl.apply(obj, args)
          if (promisify.has(String(prop)) && !(result instanceof Promise)) {
            return Promise.resolve(result)
          }
          return result
        }
      }
      return Reflect.get(obj, prop)
    },
    set(obj, prop, value) {
      return Reflect.set(obj, prop, value)
    },
  })
}
