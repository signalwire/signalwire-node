import { IDevice, IRelayDevice, IRelayDevicePhoneParams, IRelayDeviceAgoraParams, IRelayDeviceWebRTCParams, IRelayDeviceSipParams } from '../../../util/interfaces'
import { CallType } from '../../../util/constants/relay'

abstract class BaseDevice implements IRelayDevice {
  public type: CallType
  public params: IRelayDevice['params'] = null
  abstract get from(): string
  abstract get to(): string

  protected _addTimeout(timeout: number) {
    if (timeout) {
      this.params.timeout = timeout
    }
  }
}

export class Phone extends BaseDevice {
  public type = CallType.Phone
  public params: IRelayDevicePhoneParams = null

  constructor(options: IDevice) {
    super()
    const { from: from_number, to: to_number, timeout } = options
    this.params = { from_number, to_number }
    this._addTimeout(timeout)
  }

  get from(): string {
    return this.params.from_number
  }

  get to(): string {
    return this.params.to_number
  }
}

export class Agora extends BaseDevice {
  public type = CallType.Agora
  public params: IRelayDeviceAgoraParams = null

  constructor(options: IDevice) {
    super()
    const { from, to, appId: appid, channel, timeout } = options
    this.params = { from, to, appid, channel }
    this._addTimeout(timeout)
  }

  get from(): string {
    return this.params.from
  }

  get to(): string {
    return this.params.to
  }
}

export class Sip extends BaseDevice {
  public type = CallType.Sip
  public params: IRelayDeviceSipParams = null

  constructor(options: IDevice) {
    super()
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

  get from(): string {
    return this.params.from
  }

  get to(): string {
    return this.params.to
  }
}

export class WebRTC extends BaseDevice {
  public type = CallType.WebRTC
  public params: IRelayDeviceWebRTCParams = null

  constructor(options: IDevice) {
    super()
    const { from, to, codecs, timeout } = options
    this.params = { from, to }
    this._addTimeout(timeout)
    if (codecs) {
      this.params.codecs = codecs
    }
  }

  get from(): string {
    return this.params.from
  }

  get to(): string {
    return this.params.to
  }
}
