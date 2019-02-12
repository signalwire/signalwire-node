import { CallType } from '../../../common/src/util/constants/relay'
import { cleanNumber } from '../../../common/src/util/helpers'
import { ICallDevice } from '../../../common/src/util/interfaces'

interface DeepArray<T> extends Array<T | DeepArray<T>> { }

export const detectCallType = (to: string): string => {
  // TODO: check call type by "to"
  return CallType.Phone
}

interface DeviceAccumulator {
  devices: DeepArray<ICallDevice>,
  nested: boolean
}

export const reduceConnectParams = (peers: any[], callDevice: ICallDevice): DeepArray<ICallDevice> => {
  const { params: { from_number: defaultFromNumber, timeout: defaultTimeout } } = callDevice
  const _reducer = (accumulator: DeviceAccumulator, peer: any, currentIndex: number, sourceArray: any[]) => {
    let tmp: ICallDevice = null
    if (peer instanceof Array) {
      tmp = peer.reduce(_reducer, { devices: [], nested: true }).devices
    } else if (typeof peer === 'string') {
      tmp = { type: detectCallType(peer), params: { to_number: cleanNumber(peer), from_number: cleanNumber(defaultFromNumber), timeout: defaultTimeout } }
    } else if (typeof peer === 'object') {
      const { to_number, from_number, timeout = defaultTimeout } = peer
      tmp = { type: detectCallType(to_number), params: { to_number: cleanNumber(to_number), from_number: cleanNumber(from_number), timeout: Number(timeout) } }
    }
    if (tmp) {
      const castArray = accumulator.nested || peer instanceof Array
      castArray ? accumulator.devices.push(tmp) : accumulator.devices.push([tmp])
    }
    return accumulator
  }
  const { devices } = peers.reduce(_reducer, { devices: [], nested: false })
  // console.warn('reduceConnectParams', JSON.stringify(devices, null, 2))
  return devices
}
