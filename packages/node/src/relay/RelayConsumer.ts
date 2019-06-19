import RelayClient from './index'
import logger from '../../../common/src/util/logger'
import { isFunction } from 'util'
import { IRelayConsumerParams } from '../../../common/src/util/interfaces'

export default class RelayConsumer {
  host: string = null
  project: string = null
  token: string = null
  contexts: string[] = []
  onIncomingCall: Function
  onIncomingFax: Function
  onTask: Function
  setup: Function

  protected client: RelayClient

  constructor(params: IRelayConsumerParams) {
    const { host, project, token, contexts = [], onIncomingCall, onIncomingFax, onTask, setup } = params
    if (!project || !token) {
      throw 'SignalWire "project" and "token" are required!'
    }
    this.host = host
    this.project = project
    this.token = token
    this.contexts = contexts
    if (isFunction(onIncomingCall)) {
      this.onIncomingCall = onIncomingCall.bind(this)
    }
    if (isFunction(onIncomingFax)) {
      this.onIncomingFax = onIncomingFax.bind(this)
    }
    if (isFunction(onTask)) {
      this.onTask = onTask.bind(this)
    }
    if (isFunction(setup)) {
      this.setup = setup.bind(this)
    }
  }

  async run() {
    const { host, project, token } = this
    this.client = new RelayClient({ host, project, token })
    this.client.__logger.setLevel(this.client.__logger.levels.INFO)

    this.client.on('signalwire.error', error => {
      logger.error('RelayConsumer error:', error)
    })

    this.client.on('signalwire.ready', async (client: RelayClient) => {
      try {
        await this._registerCallingContexts()
      } catch (error) {
        logger.error('RelayConsumer error registering contexts:', error)
      }
      if (isFunction(this.setup)) {
        this.setup.call(this)
      }
    })

    await this.client.connect()
  }

  private async _registerCallingContexts() {
    const promises = this.contexts.map(context => this.client.calling.onInbound(context, this.onIncomingCall))
    const results = await Promise.all(promises)
    results.forEach(res => logger.info(res.message))
    return results
  }
}
