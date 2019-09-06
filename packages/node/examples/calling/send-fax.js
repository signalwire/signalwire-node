const { RelayConsumer } = require('../..')

const consumer = new RelayConsumer({
  project: process.env.PROJECT,
  token: process.env.TOKEN,
  contexts: ['home', 'office'],
  teardown: (consumer) => {
    console.log('teardown now and close.')
  },
  ready: async ({ client }) => {
    const params = { type: 'phone', from: '+1xxx', to: '+1yyy' }
    const { successful, call } = await client.calling.dial(params)
    if (!successful) {
      console.error('Outbound call failed or not answered.')
      return
    }

    const result = await call.faxSend('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')
    if (result.successful) {
      console.log('getDirection: ', result.direction)
      console.log('getIdentity: ', result.identity)
      console.log('getRemoteIdentity: ', result.remoteIdentity)
      console.log('getDocument: ', result.document)
      console.log('getPages: ', result.pages)
      console.log('event: ', result.event)
    }
  }
})

consumer.run()
