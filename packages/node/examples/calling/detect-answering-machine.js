const { RelayConsumer } = require('../..')

const consumer = new RelayConsumer({
  project: process.env.PROJECT,
  token: process.env.TOKEN,
  contexts: ['home', 'office'],
  teardown: (consumer) => {
    console.log('Consumer teardown. Cleanup..')
  },
  ready: async ({ client }) => {
    const params = { type: 'phone', from: '+1xxx', to: '+1yyy' }
    const { successful: dialed, call } = await client.calling.dial(params)
    if (!dialed) {
      console.error('Outbound call failed or not answered.')
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
