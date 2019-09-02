const { RelayConsumer } = require('../..')

const consumer = new RelayConsumer({
  project: process.env.PROJECT,
  token: process.env.TOKEN,
  contexts: ['home', 'office'],
  teardown: (consumer) => {
    console.log('teardown now and close.')
  },
  onIncomingCall: async (call) => {
    console.log('Inbound call', call.id, call.from, call.to)
    await call.answer()

    call.on('detect.update', (call, params) => console.log('DETECT UPDATE', params))

    const { successful, result, event } = await call.detect({ type: 'digit' })

    if (successful) {
      console.log('Detection result:', result, 'Last event:', event)
    } else {
      console.error('Error during detection', event)
    }

    await call.hangup()
  }
})

consumer.run()
