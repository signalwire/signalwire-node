import { mutateStorageKey } from '../helpers'

const getItem = async (key): Promise<string> => window.localStorage.getItem(mutateStorageKey(key))
const setItem = async (key, value): Promise<void> => window.localStorage.setItem(mutateStorageKey(key), value)
const removeItem = async (key): Promise<void> => window.localStorage.removeItem(mutateStorageKey(key))

export {
  getItem,
  setItem,
  removeItem
}
