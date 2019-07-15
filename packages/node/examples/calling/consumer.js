const { RelayConsumer } = require('../..')

const consumer = new RelayConsumer({
  project: '',
  token: '',
  contexts: ['home', 'office'],
  setup: (consumer) => {
    consumer.project = ''
    consumer.token = ''
  },
  teardown: (consumer) => {
    console.log('teardown now and close.')
  },
  onTask: async (message) => {
    console.log('New task:', message)
  },
  onIncomingCall: async (call) => {
    console.log('Inbound call', call.id, call.from, call.to)
    const answerResult = await call.answer()
    if (!answerResult.successful) {
      console.error('Answer Error')
      return
    }
    const collect = { initial_timeout: 10, digits: { max: 3, digit_timeout: 5 } }
    const prompt = await call.promptTTS(collect, { text: 'Welcome at SignalWire! Please, enter your PIN' })
    if (prompt.successful) {
      await call.playTTS({ text: `You entered: ${prompt.result}. Thanks and good bye!` })
    } else {
      await call.playTTS({ text: 'Errors during prompt.' })
    }
    await call.hangup()

    // - Handle Fax Receive
    // const result = await call.faxReceive()
    // if (result.successful) {
    //   console.log('getDirection: ', result.direction)
    //   console.log('getIdentity: ', result.identity)
    //   console.log('getRemoteIdentity: ', result.remoteIdentity)
    //   console.log('getDocument: ', result.document)
    //   console.log('getPages: ', result.pages)
    //   console.log('event: ', result.event)
    // }
  }
})

consumer.run()
