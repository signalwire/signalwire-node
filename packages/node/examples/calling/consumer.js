const { RelayConsumer } = require('../..')


const consumer = new RelayConsumer({
  project: '',
  token: '',
  contexts: ['home', 'office'],
  // setup: () => {},
  onIncomingCall: async (call) => {
    console.log('Inbound call', call.id, call.from, call.to)
    try {
      await call.answer()
      await call.playTTSSync({ text: 'Hey Man! How you doing?' })
      await call.playAudioSync('https://cdn.signalwire.com/default-music/welcome.mp3')
      await call.playTTSSync({ text: 'Thanks and Good Bye!' })
      await call.hangup()
    } catch (error) {
      console.error(error)
    }
  },
  // onIncomingFax: (fax) => {

  // },
  // onTask: (task) => {

  // }
})

consumer.run()
