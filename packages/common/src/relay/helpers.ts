import { ICallDevice, IMakeCallParams, DeepArray, ICallingRecord, IRelayCallingRecord, IRelayCallingPlay, ICallingPlay } from '../util/interfaces'

interface DeviceAccumulator {
  devices: DeepArray<ICallDevice>,
  nested: boolean
}

export const reduceConnectParams = (peers: DeepArray<IMakeCallParams>, callDevice: ICallDevice): DeepArray<ICallDevice> => {
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

export const prepareRecordParams = (params: ICallingRecord): IRelayCallingRecord => {
  const { audio = {}, type, ...flattenedParams } = params
  return { audio: { ...audio, ...flattenedParams } }
}

export const preparePlayParams = (mediaList: (ICallingPlay | IRelayCallingPlay)[]): IRelayCallingPlay[] => {
  const play = []
  mediaList.forEach(media => {
    if ('params' in media) {
      const { type, params = {}, ...flattenedParams } = media
      play.push({ type, params: { ...params, ...flattenedParams } })
    } else {
      const { type, ...params } = media
      play.push({ type, params })
    }
  })
  return play
}
