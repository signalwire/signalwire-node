import { CallType } from '../../../common/src/util/constants/relay'
import { cleanNumber } from '../../../common/src/util/helpers'
import { ICallDevice, IMakeCallParams } from '../../../common/src/util/interfaces'

interface DeepArray<T> extends Array<T | DeepArray<T>> { }

export const detectCallType = (_to: string = ''): CallType => {
  let to: string = ''
  try { to = _to.trim() } catch {}
  if (!to) {
    return null
  }
  if (/^sip:/.test(to)) {
    return CallType.Sip
  }
  if (cleanNumber(to)) {
    return CallType.Phone
  }
  return CallType.WebRTC
}

interface DeviceAccumulator {
  devices: DeepArray<ICallDevice>,
  nested: boolean
}

export const cleanCallingParams = (params: IMakeCallParams): { type: CallType, from_number: string, to_number: string, timeout: number } => {
  const { from = '', to = '', timeout = 30 } = params
  const type = detectCallType(to)
  switch (type) {
    case CallType.Phone:
      return { type, from_number: cleanNumber(from), to_number: cleanNumber(to), timeout: Number(timeout) }
    case CallType.Sip:
    case CallType.WebRTC:
      return { type, from_number: from.trim(), to_number: to.trim(), timeout: Number(timeout) }
  }
  return { type, from_number: from, to_number: to, timeout: Number(timeout) }
}

export const reduceConnectParams = (peers: any[], callDevice: ICallDevice): DeepArray<ICallDevice> => {
  const { params: { from_number: defaultFromNumber, timeout: defaultTimeout } } = callDevice
  const _reducer = (accumulator: DeviceAccumulator, peer: any, currentIndex: number, sourceArray: any[]) => {
    let tmp: ICallDevice = null
    if (peer instanceof Array) {
      tmp = peer.reduce(_reducer, { devices: [], nested: true }).devices
    } else if (typeof peer === 'string') {
      const { type, from_number, to_number, timeout } = cleanCallingParams({ from: defaultFromNumber, to: peer, timeout: defaultTimeout })
      if (type) {
        tmp = { type, params: { to_number, from_number, timeout } }
      }
    } else if (typeof peer === 'object') {
      const { to, from = defaultFromNumber, timeout: _timeout = defaultTimeout } = peer
      const { type, from_number, to_number, timeout } = cleanCallingParams({ from, to, timeout: _timeout })
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
