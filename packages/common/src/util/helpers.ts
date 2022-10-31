import { v4 as uuidv4 } from 'uuid'
import { STORAGE_PREFIX } from './constants'

// hack to remove undefined values from the object
export const deepCopy = (obj: Object) => JSON.parse(JSON.stringify(obj))

export const objEmpty = (obj: Object) => Object.keys(obj).length === 0

export const mutateStorageKey = (key: string) => `${STORAGE_PREFIX}${key}`

export const mutateLiveArrayData = (data: any[]) => {
  const [options, memberData, visibility] = data
  const {
    memberID: participantId,
    callerIDNumber: participantNumber,
    callerIDName: participantName,
    company: participantCompany
  } = memberData
  return { participantId, participantNumber, participantName, participantCompany, visibility, ...options }
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

export const isFunction = (variable: any): boolean => variable instanceof Function || typeof variable === 'function'

export const findElementByType = (tag: HTMLMediaElement | string | Function): HTMLMediaElement => {
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
export const destructResponse = (response: any, nodeId: string = null): { [key: string]: any } => {
  const { result = {}, error } = response
  if (error) {
    return { error }
  }
  const { result: nestedResult = null } = result
  if (nestedResult === null) {
    if (nodeId !== null) {
      result.node_id = nodeId
    }
    return { result }
  }
  const { code = null, node_id = null, result: vertoResult = null } = nestedResult
  if (code && code !== '200') {
    return { error: nestedResult }
  }
  if (vertoResult) {
    return destructResponse(vertoResult, node_id)
  }
  return { result: nestedResult }
}

export const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export const roundToFixed = (value: number, num = 2) => {
  return Number(value.toFixed(num))
}

type Timer =
  | 'cantina:sdpReady'
  | 'cantina:vertoLogin'

export const sdkTimer = (label?: Timer) => {
  const tmp: string = label ?? uuidv4()

  return {
    start: () => console.time(tmp),
    stop: () => console.timeEnd(tmp),
  }
}
