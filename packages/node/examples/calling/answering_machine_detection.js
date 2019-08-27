const { RelayConsumer } = require('../..')

const consumer = new RelayConsumer({
  project: process.env.PROJECT,
  token: process.env.TOKEN,
  contexts: ['home', 'office'],
  teardown: (consumer) => {
    console.log('teardown now and close.')
  },
  ready: async ({ client }) => {
    const { successful: dialed, call } = await client.calling.dial({ type: 'phone', from: '+1xxx', to: '+1yyy' })
    if (!dialed) {
      console.error('Dial error!')
      return
    }

    // Try to detect a machine and wait for 'beep'
    const { successful, result, event } = await call.amd({ wait_for_beep: true })

    if (successful) {
      console.log('Detection result:', result, 'Last event:', event)
    } else {
      console.error('Error during detection', event)
    }

    await call.hangup()
  }
})

consumer.run()
