const { RelayConsumer } = require('../..')

const consumer = new RelayConsumer({
  project: process.env.PROJECT,
  token: process.env.TOKEN,
  contexts: ['default'],
  ready: async ({ client }) => {
    // client.__logger.setLevel(client.__logger.levels.DEBUG)
  },
  onIncomingCall: async (call) => {
    console.log('Inbound call', call.id, call.from, call.to, call.headers, call.codecs)
    const answerResult = await call.answer()

    if (!answerResult.successful) {
      console.error('Error during call answer')
      return
    }

    let connectResult = await call.connect([
      {
        type: 'sip',
        from: '<YOUR_FROM_SIP_ENDPOINT_HERE>',
        to: '<YOUR_TO_SIP_ENDPOINT_HERE>',
        codecs: ['PCMU', 'PCMA', 'OPUS', 'G729', 'G722', 'VP8', 'H264'],
        timeout: 30
      },
      {
        type: 'sip',
        from: '<YOUR_FROM_SIP_ENDPOINT_HERE>',
        to: '<YOUR_TO_SIP_ENDPOINT_2_HERE>',
        codecs: ['PCMU', 'PCMA', 'OPUS', 'G729', 'G722', 'VP8', 'H264'],
        timeout: 30
      },
    ]);

    if (connectResult.successful) {
      let peer = call.peer;
      // console.log(call.id, call.peer.id, call.peer.peer.id);
      console.log(peer.headers, peer.codecs);
      call.on('ended', async () => {
        console.log(`original call hangup`);
        await peer.hangup()
      });
      peer.on('ended', async () => {
        console.log(`peer call hanged up`);
        await call.hangup()
      });
    } else {
      await call.playTTS({ text: "We couldn't connect your call. Goodbye." });
      await call.hangup();
    }
  }
})

consumer.run()
