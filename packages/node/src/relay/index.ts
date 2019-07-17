import BaseSession from '../../../common/src/BaseSession'
import Calling from '../../../common/src/relay/calling/Calling'
import Tasking from '../../../common/src/relay/tasking/Tasking'
import { ISignalWireOptions } from '../../../common/src/util/interfaces'
import logger from '../../../common/src/util/logger'

export default class RelayClient extends BaseSession {

  private _calling: Calling = null
  private _tasking: Tasking = null

  constructor(public options: ISignalWireOptions) {
    super(options)
    this._handleSignals()
  }

  get calling(): Calling {
    if (!this._calling) {
      this._calling = new Calling(this)
    }
    return this._calling
  }

  get tasking(): Tasking {
    if (!this._tasking) {
      this._tasking = new Tasking(this)
    }
    return this._tasking
  }

  private _handleSignals(): void {
    const _gracefulDisconnect = async () => {
      logger.info('Disconnecting from Relay...')
      await this.disconnect()
    }

    process.on('SIGTERM', _gracefulDisconnect)
    process.on('SIGINT', _gracefulDisconnect)
  }
}
