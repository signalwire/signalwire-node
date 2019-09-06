const { RelayConsumer } = require('../..')

const consumer = new RelayConsumer({
  project: process.env.PROJECT,
  token: process.env.TOKEN,
  contexts: ['home', 'office'],
  teardown: (consumer) => {
    console.log('Consumer teardown. Cleanup..')
  },
  onTask: (task) => {
    console.log('Inbound task payload:', task)
  }
})

consumer.run()
