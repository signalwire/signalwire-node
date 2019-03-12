import { ICallDevice, IMakeCallParams } from '../util/interfaces'

interface DeepArray<T> extends Array<T | DeepArray<T>> { }

interface DeviceAccumulator {
  devices: DeepArray<ICallDevice>,
  nested: boolean
}

export const reduceConnectParams = (peers: IMakeCallParams[], callDevice: ICallDevice): DeepArray<ICallDevice> => {
  const { params: { from_number: defaultFromNumber, timeout: defaultTimeout } } = callDevice
  const _reducer = (accumulator: DeviceAccumulator, peer: IMakeCallParams) => {
    let tmp: ICallDevice = null
    if (peer instanceof Array) {
      tmp = peer.reduce(_reducer, { devices: [], nested: true }).devices
    } else if (typeof peer === 'object') {
      const { type, from: from_number = defaultFromNumber, to: to_number, timeout = defaultTimeout } = peer
      if (type) {
        tmp = { type, params: { to_number, from_number, timeout } }
      }
    }
    if (tmp) {
      const castArray = accumulator.nested || peer instanceof Array
      castArray ? accumulator.devices.push(tmp) : accumulator.devices.push([tmp])
    }
    return accumulator
  }
  const { devices } = peers.reduce(_reducer, { devices: [], nested: false })
  return devices
}
