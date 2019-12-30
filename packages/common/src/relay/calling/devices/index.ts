import logger from '../../../util/logger'
import { IMakeCallParams, IRelayDevice, IRelayDevicePhoneParams, IRelayDeviceAgoraParams, IRelayDeviceWebRTCParams, IRelayDeviceSipParams } from '../../../util/interfaces'
import { CallType } from '../../../util/constants/relay'

// TODO: move to helpers
const _isIRelayDevice = (input: IMakeCallParams | IRelayDevice): input is IRelayDevice => {
  const { type, params } = input as IRelayDevice
  return typeof type !== 'undefined' && typeof params !== 'undefined'
}

export const buildDevice = (options: (IMakeCallParams | IRelayDevice)) => {
  const { type } = options
  switch (type) {
    case CallType.Phone:
      return new PhoneDevice(options)
    case CallType.Agora:
      return new AgoraDevice(options)
    case CallType.WebRTC:
      return new WebRTCDevice(options)
    case CallType.Sip:
      return new SipDevice(options)
    default:
      logger.warn(`Unknown device type: ${type}`)
      return null
  }
}

abstract class BaseDevice implements IRelayDevice {
  public type: CallType
  public params: IRelayDevice['params'] = null
  protected abstract _buildParams(options: IMakeCallParams): void
  abstract get from(): string
  abstract get to(): string

  constructor(options: (IMakeCallParams | IRelayDevice)) {
    if (_isIRelayDevice(options)) {
      this.params = options.params
    } else {
      this._buildParams(options)
    }
  }

  protected _addTimeout(timeout: number) {
    if (timeout) {
      this.params.timeout = timeout
    }
  }
}

export class PhoneDevice extends BaseDevice {
  public type = CallType.Phone
  public params: IRelayDevicePhoneParams

  get from(): string {
    return this.params.from_number
  }

  get to(): string {
    return this.params.to_number
  }

  protected _buildParams(options: IMakeCallParams) {
    const { from: from_number, to: to_number, timeout } = options
    this.params = { from_number, to_number }
    this._addTimeout(timeout)
  }
}

export class AgoraDevice extends BaseDevice {
  public type = CallType.Agora
  public params: IRelayDeviceAgoraParams

  get from(): string {
    return this.params.from
  }

  get to(): string {
    return this.params.to
  }

  protected _buildParams(options: IMakeCallParams) {
    const { from, to, appId: appid, channel, timeout } = options
    this.params = { from, to, appid, channel }
    this._addTimeout(timeout)
  }
}

export class SipDevice extends BaseDevice {
  public type = CallType.Sip
  public params: IRelayDeviceSipParams

  get from(): string {
    return this.params.from
  }

  get to(): string {
    return this.params.to
  }

  protected _buildParams(options: IMakeCallParams) {
    const { from, to, codecs, headers, webrtcMedia = null, timeout } = options
    this.params = { from, to }
    this._addTimeout(timeout)
    if (headers) {
      this.params.headers = headers
    }
    if (codecs) {
      this.params.codecs = codecs
    }
    if (webrtcMedia !== null) {
      this.params.webrtc_media = webrtcMedia
    }
  }
}

export class WebRTCDevice extends BaseDevice {
  public type = CallType.WebRTC
  public params: IRelayDeviceWebRTCParams

  get from(): string {
    return this.params.from
  }

  get to(): string {
    return this.params.to
  }

  _buildParams(options: IMakeCallParams) {
    const { from, to, codecs, timeout } = options
    this.params = { from, to }
    this._addTimeout(timeout)
    if (codecs) {
      this.params.codecs = codecs
    }
  }
}
