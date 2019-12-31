import { IMakeCallParams, IDevice, DeepArray, ICallingRecord, IRelayCallingRecord, IRelayCallingPlay, ICallingPlay, ICallingPlayParams, ICallingCollect, IRelayCallingCollect, ICallingCollectAudio, ICallingPlayTTS, ICallingCollectTTS, ICallingDetect, IRelayCallingDetect, ICallingTapTap, ICallingTapFlat, IRelayCallingTapTap, IRelayCallingTapDevice, ICallingTapDevice, ICallingCollectRingtone, ICallingPlayRingtone, ICallingConnectParams } from './calling/interfaces'
import { PlayType } from './calling/constants'
import { deepCopy, objEmpty } from '../util/helpers'
import * as Devices from '../relay/calling/devices'

export const prepareDevices = (devices: DeepArray<IMakeCallParams>, defaultFrom: string = null, defaultTimeout: number = null, nested: boolean = false): DeepArray<IDevice> => {
  const relayDevices: DeepArray<IDevice> = []
  for (const device of devices) {
    if (device instanceof Array) {
      const tmp: DeepArray<IDevice> = prepareDevices(device, defaultFrom, defaultTimeout, true)
      relayDevices.push(tmp)
    } else if (typeof device === 'object') {
      if (defaultFrom && !device.hasOwnProperty('from')) {
        device.from = defaultFrom
      }
      if (defaultTimeout && !device.hasOwnProperty('timeout')) {
        device.timeout = defaultTimeout
      }
      const tmp: IDevice = Devices.buildDevice(device)
      if (tmp) {
        nested ? relayDevices.push(tmp) : relayDevices.push([tmp])
      }
    }
  }
  return relayDevices
}

export const prepareConnectParams = (params: [ICallingConnectParams] | DeepArray<IMakeCallParams>, defaultFrom: string, defaultTimeout: number): [DeepArray<IDevice>, IRelayCallingPlay] => {
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
    prepareDevices(devices, defaultFrom, defaultTimeout),
    ringback
  ]
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
    { type: PlayType.Audio, params: { url } }
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
    { type: PlayType.TTS, params: ttsOptions }
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
    { type: PlayType.Ringtone, params: mediaParams }
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

const _isICallingPlayParams = (params: ICallingPlayParams | IRelayCallingPlay | ICallingPlay): params is ICallingPlayParams => {
  return (params as ICallingPlayParams).media !== undefined
}

const _isICallingConnectParams = (params: ICallingConnectParams | DeepArray<IMakeCallParams> | IMakeCallParams): params is ICallingConnectParams => {
  return (params as ICallingConnectParams).devices !== undefined
}
