// @ts-ignore
import { AsyncStorage } from 'react-native'
import { mutateStorageKey, safeParseJson } from '../helpers'
import logger from '../logger'

const getItem = async (key: string): Promise<any> => {
  const res = await AsyncStorage.getItem(mutateStorageKey(key))
    .catch(error => {
      logger.debug('AsyncStorage.getItem error', error)
      return ''
    })
  return safeParseJson(res)
}

const setItem = (key: string, value: any): Promise<void> => {
  if (typeof value === 'object') {
    value = JSON.stringify(value)
  }
  return AsyncStorage.setItem(mutateStorageKey(key), value)
}

const removeItem = (key: string): Promise<void> => AsyncStorage.removeItem(mutateStorageKey(key))

export {
  getItem,
  setItem,
  removeItem
}
