const { RelayConsumer } = require('../..')

const consumer = new RelayConsumer({
  project: process.env.PROJECT,
  token: process.env.TOKEN,
  contexts: ['home', 'office'],
  teardown: (consumer) => {
    console.log('Consumer teardown. Cleanup..')
  },
  onIncomingMessage: (message) => {
    console.log('Message received on context:', message.context)
    console.log(message)
  }
})

consumer.run()
