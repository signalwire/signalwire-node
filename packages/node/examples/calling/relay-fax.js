const { RelayClient } = require('../..')

const project = ''
const token = ''

if (!project || !token) {
  throw new Error('Set your SignalWire project and token before run the example.')
}

console.log('Init client with: ', project, token, '\n')
const client = new RelayClient({ project, token })

client.on('signalwire.ready', async (client) => {
  const { successful, call } = await client.calling.dial({ type: 'phone', from: '+1xxx', to: '+1yyy' })
  if (!successful) {
    console.error('Dial error!')
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
})

client.connect()
