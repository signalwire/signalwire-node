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
  onTask: Function
  setup: Function
  ready: Function
  tearDown: Function

  protected client: RelayClient

  constructor(params: IRelayConsumerParams) {
    const { host, project, token, contexts = [], onIncomingCall, onTask, setup, ready, tearDown } = params
    this.host = host
    this.project = project
    this.token = token
    this.contexts = contexts
    if (isFunction(onIncomingCall)) {
      this.onIncomingCall = onIncomingCall.bind(this)
    }
    if (isFunction(onTask)) {
      this.onTask = onTask.bind(this)
    }
    if (isFunction(setup)) {
      this.setup = setup.bind(this)
    }
    if (isFunction(ready)) {
      this.ready = ready.bind(this)
    }
    if (isFunction(tearDown)) {
      process.on('exit', () => tearDown(this))
    }
  }

  async run() {
    if (isFunction(this.setup)) {
      this.setup(this)
    }
    const { host, project, token } = this
    if (!project || !token) {
      logger.error('SignalWire "project" and "token" are required!')
      return
    }
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
      if (isFunction(this.ready)) {
        this.ready(this)
      }
    })

    await this.client.connect()
  }

  private async _registerCallingContexts() {
    if (!isFunction(this.onIncomingCall)) {
      return null
    }
    const promises = this.contexts.map(context => this.client.calling.onInbound(context, this.onIncomingCall))
    const results = await Promise.all(promises)
    results.forEach(res => logger.info(res.message))
    return results
  }
}
