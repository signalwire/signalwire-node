const { RelayConsumer } = require('../..')

/// See handle-messages.js to see how to handle inbound SMS/MMS within the Consumer!

const consumer = new RelayConsumer({
  project: process.env.PROJECT,
  token: process.env.TOKEN,
  contexts: ['home', 'office'],
  teardown: (consumer) => {
    console.log('teardown now and close.')
  },
  ready: async ({ client }) => {
    // Once the Consumer is ready send an SMS
    const params = {
      context: 'office',
      from: '+1yyy',
      to: '+1xxx',
      body: 'Welcome at SignalWire!' }
    const { successful, messageId } = await client.messaging.send(params)
    if (!successful) {
      console.error('Error sending the SMS')
      return
    }

    console.log('Message ID: ', messageId)
  },
  onMessageStateChange: (message) => {
    // Keep track of your SMS state changes
    console.log('Message state changed', message.id, message.state)
  }
})

consumer.run()
