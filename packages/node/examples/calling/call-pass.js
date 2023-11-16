const { RelayConsumer } = require('../..')

const consumer = new RelayConsumer({
  host: 'relay.swire.io',
  project: process.env.PROJECT,
  token: process.env.TOKEN,
  contexts: ['home', 'office'],
  ready: (consumer) => {
    console.log('Consumer ready..')
  },
  teardown: (consumer) => {
    console.log('Consumer teardown. Cleanup..')
  },
  onIncomingCall: async (call) => {
    console.log('Inbound call', call.id, call.from, call.to)

    // Pass call to another consumer 
    const passResult = await call.pass()
    if (!passResult.successful) {
      console.error('Error passing the call')
      return
    }
    
    console.log('Call passed to another consumer!')
  }
})

consumer.run()
