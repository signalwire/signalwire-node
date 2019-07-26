const { RelayClient } = require('../..')

const project = process.env.PROJECT
const token = process.env.TOKEN

if (!project || !token) {
  throw new Error('Set your SignalWire project and token before run the example.')
}

console.log('Init client with: ', project, token, '\n')
const client = new RelayClient({ host: 'relay.swire.io', project, token })

client.on('signalwire.ready', async (client) => {
  const params = { context: 'office', from_number: '+1yyy', to_number: '+1xxx', body: 'Welcome!' }
  const { successful, messageId } = await client.messaging.send(params)
  if (!successful) {
    console.error('Message send error!')
    return
  }

  console.log('Message ID: ', messageId)
})

client.connect()
