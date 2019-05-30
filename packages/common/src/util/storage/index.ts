import { mutateStorageKey, safeParseJson } from '../helpers'

const _inNode = () => typeof window === 'undefined' && typeof process !== 'undefined'

const getItem = async (key: string): Promise<any> => {
  if (_inNode()) {
    return null
  }
  const res = window.localStorage.getItem(mutateStorageKey(key))
  return safeParseJson(res)
}

const setItem = async (key: string, value: any): Promise<void> => {
  if (_inNode()) {
    return null
  }
  if (typeof value === 'object') {
    value = JSON.stringify(value)
  }
  window.localStorage.setItem(mutateStorageKey(key), value)
}

const removeItem = async (key: string): Promise<void> => {
  if (_inNode()) {
    return null
  }
  return window.localStorage.removeItem(mutateStorageKey(key))
}

export {
  getItem,
  setItem,
  removeItem
}
