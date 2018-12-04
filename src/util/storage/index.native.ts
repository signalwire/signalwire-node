// @ts-ignore
import { AsyncStorage } from 'react-native'
import { mutateStorageKey } from '../helpers'

const getItem = (key): Promise<string> => AsyncStorage.getItem(mutateStorageKey(key))
const setItem = (key, value): Promise<void> => AsyncStorage.setItem(mutateStorageKey(key), value)
const removeItem = (key): Promise<void> => AsyncStorage.removeItem(mutateStorageKey(key))

export {
  getItem,
  setItem,
  removeItem
}
