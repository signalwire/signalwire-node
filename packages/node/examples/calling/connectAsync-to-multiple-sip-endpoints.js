const { RelayConsumer } = require('../..')

const consumer = new RelayConsumer({
  project: process.env.PROJECT,
  token: process.env.TOKEN,
  contexts: ['default'],
  onIncomingCall: async (call) => {
    console.log('Inbound call', call.id, call.from, call.to)
    const answerResult = await call.answer()
    if (!answerResult.successful) {
      console.error('Error during call answer')
      return
    }
    let connectAction = await call.connectAsync([
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
      }
    ]);

    let peer;

    call.on('connect.failed', async (e) => {
      console.log(e);
      await call.playTTS({ text: "Could not connect your call. Goodbye!" });
      await call.hangup();
    });

    call.on('ended', async () => {
      if (peer) await peer.hangup();
    });

    call.on('connect.connected', () => {
      peer = call.peer;
      // console.log(peer);
      // if the connected outbound call hanged up hangup the inbound call
      peer.on('ended', () => call.hangup());
    });
  }
})

consumer.run()
