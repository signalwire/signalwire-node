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

    const { successful, event } = await call.sendDigits('1w2w3w4w5w6')
    if (successful) {
      console.log('Digits sent successfully!', event)
    } else {
      console.error('Error sending digits!', event)
    }

    await call.hangup()
  }
})

consumer.run()
