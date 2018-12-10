import BaseSession from './BaseSession'
import logger from './util/logger'
import { NOTIFICATION_TYPE, LiveArrayAction } from './util/constants'

interface ILiveArrayOptions {
  subParams: object
  onChange: Function
  onError: Function
}

export default class VertoLiveArray {
  private _lastSerno: number = 0
  private _errors: number = 0
  private _heartbeatTimeout: any = null
  private _cache: { [key: string]: object } = {}

  constructor(
    public session: BaseSession,
    public eventChannel: string,
    public laName: string,
    public options: ILiveArrayOptions
  ) {
    session.subscribe({ eventChannel, subParams: options.subParams, handler: this._handler.bind(this) })
    this.bootstrap(options)
  }

  bootstrap(obj: ILiveArrayOptions) {
    this._cache = {}
    this._broadcast('bootstrap', obj)
  }

  destroy() {
    this._clear()
    this.session.unsubscribe({ eventChannel: this.eventChannel })
  }

  checkSerno(serno) {
    if (serno < 0) {
      return true
    }
    if (this._lastSerno > 0 && serno !== (this._lastSerno + 1)) {
      if (this.options.hasOwnProperty('onError') && this.options.onError instanceof Function) {
        this.options.onError({ lastSerno: this._lastSerno, serno })
      }
      this._errors++
      if (this._errors < 3) {
        this.bootstrap(this.options)
      }
      return false
    } else {
      this._lastSerno = serno
      return true
    }
  }

  reorder(data: object) {
    // this._reorder(obj)
    this.onChange({ action: 'reorder', data })
  }

  bootObj(outerData: any) {
    this._clear()
    const { data } = outerData
    const participants = []
    for (const i in data) {
      const key = data[i][0]
      const participantObj = data[i][1]
      this._updateCache(key, participantObj)
      participants.push({ key, index: Number(i), ...this._mutateData(participantObj) })
    }
    this.onChange({ action: LiveArrayAction.Bootstrap, participants, redraw: true })
  }

  add(data: any, key: string, index: number) {
    if (key === null || key === undefined) {
      key = String(this._lastSerno)
    }
    this._updateCache(key, data)
    this.onChange({ action: LiveArrayAction.Add, key, index, redraw: !this._isCached(key), ...this._mutateData(data) })
  }

  modify(data: any, key: string, index: number) {
    this._updateCache(key, data)
    this.onChange({ action: LiveArrayAction.Modify, key, index, ...this._mutateData(data) })
  }

  del(data: any, key: string, index: number) {
    if (this._isCached(key)) {
      delete this._cache[key]
      this.onChange({ action: LiveArrayAction.Delete, key, index, ...this._mutateData(data) })
    }
  }

  private _mutateData(data: any) {
    const [participantId, participantNumber, participantName, codec, mediaJson, participantData] = data
    const media = this._safeJsonParse(mediaJson)
    return { participantId: Number(participantId), participantNumber, participantName, codec, media, participantData }
  }

  onChange(params: object) {
    if (this.options.hasOwnProperty('onChange') && this.options.onChange instanceof Function) {
      this.options.onChange({ ...params, serno: this._lastSerno, type: NOTIFICATION_TYPE.conferenceUpdate })
    }
  }

  private _handler(params: any) {
    // console.log('LiveArray _handler', params)
    const { data: packet } = params

    if (!this.checkSerno(packet.wireSerno) && packet.name !== this.laName) {
      logger.error('VertoLiveArray invalid serno or packet name:', params)
      return
    }
    const { action, data, hashKey, arrIndex } = packet
    switch (action) {
      // case 'init':
      //   this.init(packet.wireSerno, packet.data, packet.hashKey, packet.arrIndex)
      //   break
      case 'bootObj':
        this.bootObj(packet)
        break
      case 'add':
        this.add(data, hashKey, arrIndex)
        break
      case 'modify':
        if (hashKey || arrIndex) {
          this.modify(data, hashKey, arrIndex)
        }
        break
      case 'del':
        if (hashKey || arrIndex) {
          this.del(data, hashKey, arrIndex)
        }
        break
      case 'clear':
        this.onChange({ action: 'clear' })
        break
      case 'reorder':
        this.reorder(packet.order)
        break
      default:
        this.onChange({ action, data })
        break
    }
  }

  changepage(obj) {
    this._clear()
    this._broadcast('changepage', obj)
  }

  heartbeat(obj: object = {}) {
    this._broadcast('heartbeat', obj)
    this._heartbeatTimeout = setTimeout(() => this.heartbeat(obj), 30000)
  }

  get cacheKeys() {
    return Object.keys(this._cache)
  }

  private _updateCache(key: string, data: object): void {
    this._cache[key] = data
  }

  private _isCached(key: string): boolean {
    return this._cache.hasOwnProperty(key)
  }

  private _clear() {
    clearTimeout(this._heartbeatTimeout)
    this._cache = {}
    this._lastSerno = 0
  }

  private _broadcast(command: string, obj: any = {}) {
    const context = this.eventChannel
    const name = this.laName
    this.session.broadcast({ eventChannel: context, data: { liveArray: { command, context, name, obj } } })
  }

  private _safeJsonParse(jsonString: string) {
    let tmp = {}
    try {
      tmp = JSON.parse(jsonString.replace(/ID"/g, 'Id"'))
    } catch (error) {
      logger.warn('VertoLiveArray invalid media JSON string:', jsonString)
    }

    return tmp
  }
}
