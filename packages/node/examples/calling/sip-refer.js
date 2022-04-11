const { RelayConsumer } = require('../..')

const consumer = new RelayConsumer({
  // host: 'relay.swire.io',
  project: process.env.PROJECT,
  token: process.env.TOKEN,
  contexts: ['home', 'office'],
  teardown: (consumer) => {
    console.log('Consumer teardown. Cleanup..')
  },
  ready: async ({ client }) => {
    const params = {
      type: 'sip',
      from: 'sip:user-2@example.com',
      to: 'sip:user-2@example.com',
    }
    const { successful: dialed, call } = await client.calling.dial(params)
    if (!dialed) {
      console.error('Outbound call failed or not answered.')
      return
    }

    await call.play({
      media: [
        { type: 'audio', url: 'https://download.samplelib.com/mp3/sample-6s.mp3' },
      ],
      volume: 6
    })

    // Refer to another SIP device
    const referResult = await call.refer({ to: 'sip:user-3@example.com' })
    if (referResult.successful) {
      console.log('Success:', referResult.referTo, referResult.referNotifyCode, referResult.referResponseCode)
    } else {
      console.error('Refer Error', referResult.referNotifyCode, referResult.referResponseCode, referResult.event)
    }

    await call.hangup()
  }
})

consumer.run()
