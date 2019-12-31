
import { StringStringMap } from '../../util/interfaces'
import * as Devices from './devices'

export interface DeepArray<T> extends Array<T | DeepArray<T>> { }

export type IDevice = Devices.PhoneDevice | Devices.AgoraDevice | Devices.WebRTCDevice | Devices.SipDevice

type ICallType = 'phone' | 'agora' | 'webrtc' | 'sip'

export interface ICall {
  id: string
  tag?: string
  nodeId: string
  state: string
  prevState: string
  context: string
  device: IDevice
  targets: DeepArray<IDevice>
  attemptedDevices: IDevice[]
  // peer: Call
  type: ICallType
  to: string
  from: string
  timeout: number
  active: boolean
  failed: boolean
  answered: boolean
  ended: boolean
  busy: boolean
  on: Function
  off: Function
  dial: Function
  hangup: Function
  record: Function
  recordAsync: Function
  answer: Function
  connect: Function
  connectAsync: Function
  disconnect: Function
  play: Function
  playAsync: Function
  playAudio: Function
  playAudioAsync: Function
  playRingtone: Function
  playRingtoneAsync: Function
  playSilence: Function
  playSilenceAsync: Function
  playTTS: Function
  playTTSAsync: Function
  prompt: Function
  promptAsync: Function
  promptAudio: Function
  promptAudioAsync: Function
  promptRingtone: Function
  promptRingtoneAsync: Function
  promptTTS: Function
  promptTTSAsync: Function
  waitFor: Function
  waitForRinging: Function
  waitForAnswered: Function
  waitForEnding: Function
  waitForEnded: Function
  faxReceive: Function
  faxReceiveAsync: Function
  faxSend: Function
  faxSendAsync: Function
  detect: Function
  detectAsync: Function
  detectAnsweringMachine: Function
  detectAnsweringMachineAsync: Function
  detectHuman?: Function
  detectHumanAsync?: Function
  detectMachine?: Function
  detectMachineAsync?: Function
  detectFax: Function
  detectFaxAsync: Function
  detectDigit: Function
  detectDigitAsync: Function
  tap: Function
  tapAsync: Function
  sendDigits: Function
  sendDigitsAsync: Function
}

export interface IRelayDevicePhoneParams {
  from_number: string
  to_number: string
  timeout?: number
}

export interface IRelayDeviceAgoraParams {
  from: string
  to: string
  appid: string
  channel: string
  timeout?: number
}

export interface IRelayDeviceWebRTCParams {
  from: string
  to: string
  timeout?: number
  codecs?: string[]
}

export interface IRelayDeviceSipParams {
  from: string
  to: string
  timeout?: number
  headers?: StringStringMap
  codecs?: string[]
  webrtc_media?: boolean
}

export interface IRelayDevice {
  type: ICallType
  params: IRelayDevicePhoneParams | IRelayDeviceAgoraParams | IRelayDeviceWebRTCParams | IRelayDeviceSipParams
}

export interface IMakeCallParams {
  type: ICallType
  from?: string
  to: string
  timeout?: number
  appId?: string
  channel?: string
  headers?: StringStringMap
  webrtcMedia?: boolean
  codecs?: string[]
}

export interface ICallPeer {
  call_id: string
  node_id: string
  device?: IDevice
}

export interface ICallOptions {
  device?: IRelayDevice
  targets?: DeepArray<IDevice>
  peer?: ICallPeer
  node_id?: string
  call_id?: string
  call_state?: string
  context?: string
}

interface IRelayCallingRecordAudio {
  beep?: boolean
  format?: string
  stereo?: boolean
  direction?: string
  initial_timeout?: number
  end_silence_timeout?: number
  terminators?: string
}

export interface IRelayCallingRecord {
  audio: IRelayCallingRecordAudio
}

export interface ICallingRecord extends IRelayCallingRecordAudio {
  audio?: IRelayCallingRecordAudio // backwards compatibility
  type?: 'audio'
}

export interface ICallingConnectParams {
  devices: DeepArray<IMakeCallParams>
  ringback?: ICallingPlay
}

interface IRelayCallingPlayParams {
  url?: string
  text?: string
  language?: string
  gender?: string
  duration?: number
  name?: string
}

export interface IRelayCallingPlay {
  type: string
  params: IRelayCallingPlayParams
}

export interface ICallingPlay extends IRelayCallingPlayParams {
  type: string
}

export interface ICallingPlayParams {
  media: (IRelayCallingPlay | ICallingPlay)[]
  volume?: number
}

export interface ICallingPlayRingtone {
  name: string
  duration?: number
  volume?: number
}

export interface ICallingPlayTTS {
  text: string
  language?: string
  gender?: string
  volume?: number
}

export interface IRelayCallingCollect {
  initial_timeout?: number
  digits?: {
    max: number
    terminators?: string
    digit_timeout?: number
  },
  speech?: {
    end_silence_timeout?: number
    speech_timeout?: number
    language?: string
    hints?: string[]
  }
  partial_results?: boolean
}

export interface ICallingCollect extends IRelayCallingCollect {
  type?: string
  digits_max?: number
  digits_terminators?: string
  digits_timeout?: number
  end_silence_timeout?: number
  speech_timeout?: number
  speech_language?: string
  speech_hints?: string[]
  volume?: number
  media?: (IRelayCallingPlay | ICallingPlay)[]
}

export interface ICallingCollectAudio extends ICallingCollect {
  url?: string
}

export interface ICallingCollectTTS extends ICallingCollect {
  text?: string // optional for backward compatibility
  language?: string
  gender?: string
}

export interface ICallingCollectRingtone extends ICallingCollect {
  name: string
  duration?: number
}

interface IRelayCallingDetectParams {
  initial_timeout?: number
  end_silence_timeout?: number
  machine_voice_threshold?: number
  machine_words_threshold?: number
  tone?: string
  digits?: string
}

export interface IRelayCallingDetect {
  type: string
  params: IRelayCallingDetectParams
}

export interface ICallingDetect extends IRelayCallingDetectParams {
  type?: string
  timeout?: number
  wait_for_beep?: boolean
}

interface IRelayCallingTapTapParams {
  direction?: string
}

export interface IRelayCallingTapTap {
  type: 'audio'
  params: IRelayCallingTapTapParams
}

export interface ICallingTapTap extends IRelayCallingTapTapParams {
  type: IRelayCallingTapTap['type']
}

interface IRelayCallingTapDeviceParams {
  addr?: string
  port?: number
  codec?: string
  ptime?: number
  uri?: string
  rate?: number
}

export interface IRelayCallingTapDevice {
  type: string
  params: IRelayCallingTapDeviceParams
}

export interface ICallingTapDevice extends IRelayCallingTapDeviceParams {
  type?: string
}

export interface ICallingTapFlat {
  audio_direction?: string
  target_type: string
  target_addr?: string
  target_port?: number
  target_ptime?: number
  target_uri?: string
  rate?: number
  codec?: string
}
