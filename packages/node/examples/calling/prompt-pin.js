const { RelayConsumer } = require('../..')

const consumer = new RelayConsumer({
  project: process.env.PROJECT,
  token: process.env.TOKEN,
  contexts: ['home', 'office'],
  teardown: (consumer) => {
    console.log('Consumer teardown. Cleanup..')
  },
  onIncomingCall: async (call) => {
    console.log('Inbound call', call.id, call.from, call.to)
    const answerResult = await call.answer()
    if (!answerResult.successful) {
      console.error('Error during call answer')
      return
    }
    const params = {
      type: 'digits',
      digits_max: 4,
      digits_terminators: '#',
      text: 'Welcome at SignalWire. Please, enter your PIN and then # to proceed'
    }
    const { result: pin } = await call.promptTTS(params)
    if (pin && pin === '1234') {
      await call.playTTS({ text: 'You entered the proper PIN. Thank you!' })
    } else {
      await call.playTTS({ text: 'Unknown PIN.' })
    }
    await call.hangup()
  }
})

consumer.run()
