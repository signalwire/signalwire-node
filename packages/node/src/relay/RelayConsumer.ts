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
  teardown: Function

  protected client: RelayClient

  constructor(params: IRelayConsumerParams) {
    const { host, project, token, contexts = [], onIncomingCall, onTask, setup, ready, teardown } = params
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
    if (isFunction(teardown)) {
      process.on('exit', () => teardown(this))
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
      if (this.contexts.length && isFunction(this.onIncomingCall)) {
        await client.calling.onInbound(this.contexts, this.onIncomingCall).catch(error => {
          logger.error(`Error registering contexts: [${error.code}] ${error.message}`)
        })
      }
      if (this.contexts.length && isFunction(this.onTask)) {
        this.contexts.forEach(context => client.tasking.onTask(context, this.onTask))
      }
      if (isFunction(this.ready)) {
        this.ready(this)
      }
    })

    await this.client.connect()
  }
}
