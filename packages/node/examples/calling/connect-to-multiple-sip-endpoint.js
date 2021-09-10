const { allowedNodeEnvironmentFlags } = require('process')
const { RelayConsumer } = require('../..')

const consumer = new RelayConsumer({
  project: process.env.PROJECT,
  token: process.env.TOKEN,
  contexts: ['default'],
  ready: async ({ client }) => {
    // client.__logger.setLevel(client.__logger.levels.DEBUG)
  },
  onIncomingCall: async (call) => {
    console.log('Inbound call', call.id, call.from, call.to)
    const answerResult = await call.answer()

    if (!answerResult.successful) {
      console.error('Error during call answer')
      return
    }

    let connectResult = await call.connect([{
      type: 'sip',
      from: '<YOUR_FROM_SIP_ENDPOINT>',
      to: '<YOUR_TO_SIP_ENDPONT>',
      timeout: 30
    }, {
      type: 'sip',
      from: '<YOUR_FROM_SIP_ENDPOINT>',
      to: '<YOUR_TO_SIP_ENDPONT>',
      timeout: 30,
    }]);

    if (connectResult.successful) {
      let peer = connectResult.call;
      call.on('ended', async () => await peer.hangup());
      peer.on('ended', async () => await call.hangup());
    } else {
      await call.playTTS({ text: "We couldn't connect your call. Goodbye." });
      await call.hangup();
    }
  }
})

consumer.run()
