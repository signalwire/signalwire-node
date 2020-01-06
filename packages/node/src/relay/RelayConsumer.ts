import RelayClient from './index'
import logger from '../../../common/src/util/logger'
import { isFunction } from 'util'
import { IRelayConsumerParams } from '../../../common/src/util/interfaces'
import Receive from '../../../common/src/services/Receive'

export default class RelayConsumer {
  host: string = null
  project: string = null
  token: string = null
  contexts: string[] = []
  onIncomingCall: Function
  onIncomingMessage: Function
  onMessageStateChange: Function
  onTask: Function
  setup: Function
  ready: Function
  teardown: Function

  protected client: RelayClient

  constructor(params: IRelayConsumerParams) {
    const { host, project, token, contexts = [], onIncomingCall, onIncomingMessage, onMessageStateChange, onTask, setup, ready, teardown } = params
    this.host = host
    this.project = project
    this.token = token
    this.contexts = contexts
    if (isFunction(onIncomingCall)) {
      this.onIncomingCall = onIncomingCall.bind(this)
    }
    if (isFunction(onIncomingMessage)) {
      this.onIncomingMessage = onIncomingMessage.bind(this)
    }
    if (isFunction(onMessageStateChange)) {
      this.onMessageStateChange = onMessageStateChange.bind(this)
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
    const { host, project, token, contexts } = this
    if (!project || !token || !contexts.length) {
      logger('"project", "token" and "contexts" are required!')
      return
    }
    this.client = new RelayClient({ host, project, token })
    // this.client.__logger(this.client.__logger.INFO)

    this.client.on('signalwire.error', error => {
      logger('RelayConsumer error:', error)
    })

    this.client.on('signalwire.ready', async (client: RelayClient) => {
      const success = await Receive(this.client, this.contexts)
      if (success) {
        const promises = []
        if (this.onIncomingCall) {
          promises.push(client.calling.onReceive(this.contexts, this.onIncomingCall))
        }
        if (this.onIncomingMessage) {
          promises.push(client.messaging.onReceive(this.contexts, this.onIncomingMessage))
        }
        if (this.onMessageStateChange) {
          promises.push(client.messaging.onStateChange(this.contexts, this.onMessageStateChange))
        }
        if (this.onTask) {
          promises.push(client.tasking.onReceive(this.contexts, this.onTask))
        }
        await promises
      }
      if (isFunction(this.ready)) {
        this.ready(this)
      }
    })

    await this.client.connect()
  }
}
