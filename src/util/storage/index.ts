import { mutateStorageKey, safeParseJson } from '../helpers'

const getItem = async (key: string): Promise<any> => {
  const res = window.localStorage.getItem(mutateStorageKey(key))
  return safeParseJson(res)
}

const setItem = async (key: string, value: any): Promise<void> => {
  if (typeof value === 'object') {
    value = JSON.stringify(value)
  }
  window.localStorage.setItem(mutateStorageKey(key), value)
}

const removeItem = async (key: string): Promise<void> => window.localStorage.removeItem(mutateStorageKey(key))

export {
  getItem,
  setItem,
  removeItem
}
