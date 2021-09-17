const { RelayConsumer } = require('../..')

let consumer = new RelayConsumer({
  project: process.env.PROJECT,
  token: process.env.TOKEN,
  contexts: ['default'],
  ready: async ({ client }) => {
    const result = await client.calling.dial([
      {
        type: 'phone',
        from: '<YOUR_FROM_PHONE_NUMBER_1>',
        to: '<YOUR_TO_PHONE_NUMBER_1>',
        timeout: 30,
      },
      {
        type: 'phone',
        from: '<YOUR_FROM_PHONE_NUMBER_2>',
        to: '<YOUR_TO_PHONE_NUMBER_2>',
        timeout: 30,
      },
    ])

    if (result.successful) {
      await result.call.connect({
        type: 'sip',
        from: '<YOUR_FROM_SIP_ENDPOINT>',
        to: '<YOUR_TO_SIP_ENDPOINT>'
      })
    }
  }
})

consumer.run()
