import { ICallDevice, IMakeCallParams, DeepArray, ICallingRecord, IRelayCallingRecord, IRelayCallingPlay, ICallingPlay, ICallingPlayParams, ICallingCollect, IRelayCallingCollect, ICallingCollectAudio, ICallingPlayTTS, ICallingCollectTTS, ICallingTapTap, ICallingTapFlat, IRelayCallingTapTap, IRelayCallingTapDevice, ICallingTapDevice, ICallingCollectRingtone, ICallingPlayRingtone, ICallingConnectParams, IDialCallParams } from '../util/interfaces'
import { CallPlayType, DEFAULT_CALL_TIMEOUT } from '../util/constants/relay'
import { deepCopy, objEmpty } from '../util/helpers'

interface DeviceAccumulator {
  devices: DeepArray<ICallDevice>,
  nested: boolean
  options?: {
    defaultFromNumber?: string
    defaultTimeout?: number
    validate?: boolean
  }
}

export const prepareConnectParams = (params: [ICallingConnectParams] | DeepArray<IMakeCallParams>, callDevice: ICallDevice): [DeepArray<ICallDevice>, IRelayCallingPlay] => {
  let devices: DeepArray<IMakeCallParams> = []
  let ringback: IRelayCallingPlay = null
  if (params.length === 1 && _isICallingConnectParams(params[0])) {
    devices = params[0].devices
    if (params[0].ringback) {
      ringback = _destructCallingPlay(params[0].ringback)
    }
  } else {
    params.forEach(p => {
      if (!_isICallingConnectParams(p)) {
        devices.push(p)
      }
    })
  }
  return [
    reduceConnectParams(devices, callDevice),
    ringback
  ]
}

export const reduceConnectParams = (peers: DeepArray<IMakeCallParams>, callDevice: ICallDevice): DeepArray<ICallDevice> => {
  let defaultFromNumber: string
  let defaultTimeout: number
  if (callDevice.type === 'phone') {
    defaultFromNumber = callDevice.params.from_number
    defaultTimeout = callDevice.params.timeout
  } else if (callDevice.type === 'sip') {
    defaultFromNumber = callDevice.params.from
  }
  // const { params: { from_number: defaultFromNumber, timeout: defaultTimeout } } = callDevice
  // @ts-ignore
  const { devices } = peers.reduce(_reducer, {
    devices: [],
    nested: false,
    options: { defaultFromNumber, defaultTimeout, validate: false }
  })
  return devices
}

export const prepareRecordParams = (params: ICallingRecord): IRelayCallingRecord => {
  const { audio = {}, type, ...flattenedParams } = params
  return { audio: { ...audio, ...flattenedParams } }
}

const _destructCallingPlay = (media: ICallingPlay | IRelayCallingPlay): IRelayCallingPlay => {
  if ('params' in media) {
    const { type, params = {}, ...flattenedParams } = media
    return { type, params: { ...params, ...flattenedParams } }
  } else {
    const { type, ...params } = media
    return { type, params }
  }
}

export const preparePlayParams = (params: [ICallingPlayParams] | (ICallingPlay | IRelayCallingPlay)[]): [IRelayCallingPlay[], number] => {
  let mediaList: (IRelayCallingPlay | ICallingPlay)[] = []
  let volume = 0
  if (params.length === 1 && _isICallingPlayParams(params[0])) {
    mediaList = params[0].media
    volume = params[0].volume || 0
  } else {
    params.forEach(p => {
      if (!_isICallingPlayParams(p)) {
        mediaList.push(p)
      }
    })
  }
  return [
    mediaList.map(_destructCallingPlay),
    volume
  ]
}

export const preparePlayAudioParams = (params: string | { url: string, volume?: number }): [string, number] => {
  if (typeof(params) === 'string') {
    return [params, 0]
  }
  const { url, volume = 0 } = params
  return [url, volume]
}

export const preparePromptParams = (params: ICallingCollect, mediaList: (ICallingPlay | IRelayCallingPlay)[] = []): [IRelayCallingCollect, IRelayCallingPlay[], number] => {
  const collect: IRelayCallingCollect = {}
  const { initial_timeout, partial_results, type, media = mediaList, volume = 0 } = params

  let { digits, speech } = params
  if (!digits) {
    const { digits_max: max, digits_terminators: terminators, digits_timeout: digit_timeout } = params
    digits = deepCopy({ max, terminators, digit_timeout })
  }
  if (!speech) {
    const { end_silence_timeout, speech_timeout, speech_language: language, speech_hints: hints } = params
    speech = deepCopy({ end_silence_timeout, speech_timeout, language, hints })
  }

  if (initial_timeout) {
    collect.initial_timeout = initial_timeout
  }
  if (partial_results) {
    collect.partial_results = partial_results
  }
  if (!objEmpty(digits) || (type === 'digits' || type === 'both')) {
    collect.digits = digits
  }

  if (!objEmpty(speech) || (type === 'speech' || type === 'both')) {
    collect.speech = speech
  }
  const [play, __volume] = preparePlayParams(media)
  return [collect, play, volume]
}

export const preparePromptAudioParams = (params: ICallingCollectAudio, urlDeprecated: string = ''): IRelayCallingCollect => {
  const { url = urlDeprecated, ...flattenedParams } = params
  flattenedParams.media = [
    { type: CallPlayType.Audio, params: { url } }
  ]

  return flattenedParams
}

export const preparePromptTTSParams = (params: ICallingCollectTTS, ttsOptions: ICallingPlayTTS = { text: '' }): IRelayCallingCollect => {
  const { text, gender, language, ...flattenedParams } = params
  if (text) {
    ttsOptions.text = text
  }
  if (gender) {
    ttsOptions.gender = gender
  }
  if (language) {
    ttsOptions.language = language
  }
  flattenedParams.media = [
    { type: CallPlayType.TTS, params: ttsOptions }
  ]

  return flattenedParams
}

export const preparePromptRingtoneParams = (params: ICallingCollectRingtone): IRelayCallingCollect => {
  const { name, duration, ...flattenedParams } = params
  const mediaParams: ICallingPlayRingtone = { name }
  if (duration) {
    mediaParams.duration = duration
  }
  flattenedParams.media = [
    { type: CallPlayType.Ringtone, params: mediaParams }
  ]

  return flattenedParams
}

export const prepareTapParams = (params: ICallingTapTap | ICallingTapFlat, device: ICallingTapDevice = {}): { tap: IRelayCallingTapTap, device: IRelayCallingTapDevice } => {
  const tap: IRelayCallingTapTap = { type: 'audio', params: { } }
  if ('direction' in params) {
    tap.params.direction = params.direction
  } else if ('audio_direction' in params) {
    tap.params.direction = params.audio_direction
  }

  let targetType = ''
  if ('target_type' in params) {
    targetType = params.target_type
  }
  const { type = targetType, ...deviceParams } = device
  const newDevice: IRelayCallingTapDevice = { type, params: {} }
  if ('target_addr' in params) {
    deviceParams.addr = params.target_addr
  }
  if ('target_port' in params) {
    deviceParams.port = params.target_port
  }
  if ('target_ptime' in params) {
    deviceParams.ptime = params.target_ptime
  }
  if ('target_uri' in params) {
    deviceParams.uri = params.target_uri
  }
  if ('rate' in params) {
    deviceParams.rate = params.rate
  }
  if ('codec' in params) {
    deviceParams.codec = params.codec
  }
  newDevice.params = deviceParams

  return { tap, device: newDevice }
}

export const prepareDialDevices = (params: DeepArray<IMakeCallParams>): DeepArray<ICallDevice> => {
  // @ts-ignore
  return params.reduce(_reducer, { devices: [], nested: false, options: { validate: true } }).devices
}

const prepareDevice = (params: IMakeCallParams,
  defaultFromNumber: string = null,
  originalCallTimeout: number = null,
  validate: boolean): ICallDevice | undefined => {
  const { type, from = defaultFromNumber, to, timeout = originalCallTimeout ?? DEFAULT_CALL_TIMEOUT } = params
  if (validate) {
    if (!type || !to || !timeout || !from) {
      throw new TypeError(`Invalid parameters to create a new Call.`)
    }
  }

  if (params.type === 'phone') {
    return { type: params.type, params: { from_number: from, to_number: to, timeout } }
  } else if (params.type === 'sip') {
    const { headers, codecs, webrtc_media, from_name } = params
    const device: ICallDevice = { type: params.type, params: { from, to } }
    if (timeout) {
      device.params.timeout = timeout
    }
    if (codecs) {
      device.params.codecs = codecs
    }
    if (webrtc_media) {
      device.params.webrtc_media = webrtc_media
    }
    if (headers instanceof Array && headers.length) {
      device.params.headers = headers
    }
    if (from_name) {
      device.params.from_name = from_name
    }
    return device
  }
}

export const isIDialCallParams = (params: IDialCallParams | IMakeCallParams | DeepArray<IMakeCallParams>): params is IDialCallParams => {
  return (params as IDialCallParams).devices !== undefined
}

const _isICallingPlayParams = (params: ICallingPlayParams | IRelayCallingPlay | ICallingPlay): params is ICallingPlayParams => {
  return (params as ICallingPlayParams).media !== undefined
}

const _isICallingConnectParams = (params: ICallingConnectParams | DeepArray<IMakeCallParams> | IMakeCallParams): params is ICallingConnectParams => {
  return (params as ICallingConnectParams).devices !== undefined
}

const _reducer = (accumulator: DeviceAccumulator, peer: IMakeCallParams) => {
  let tmp: ICallDevice | undefined = undefined
  if (peer instanceof Array) {
    const nestedAccumulator: DeviceAccumulator = { devices: [], nested: true }

    if (accumulator.options) {
      nestedAccumulator.options = accumulator.options
    }

    tmp = peer.reduce(_reducer, nestedAccumulator).devices
  } else if (typeof peer === 'object') {
    const { defaultFromNumber, defaultTimeout, validate } = accumulator.options ?? {}
    tmp = prepareDevice(peer, defaultFromNumber, defaultTimeout, validate)
  }
  if (tmp) {
    const castArray = accumulator.nested || peer instanceof Array
    castArray ? accumulator.devices.push(tmp) : accumulator.devices.push([tmp])
  }
  return accumulator
}