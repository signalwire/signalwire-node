const { RelayConsumer } = require('../..')

const consumer = new RelayConsumer({
  project: process.env.PROJECT,
  token: process.env.TOKEN,
  contexts: ['default'],
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
    // await call.playAudio('https://cdn.signalwire.com/default-music/welcome.mp3')
    // await call.hangup()
    let currentDevice = 0;
    let connectNumbers = ['<PHONE_NO_1_HERE>', '<PHONE_NO_2_HERE' ];
    let { successful } = await call.connect({
      type: 'phone',
      to: connectNumbers[currentDevice],
      timeout: 30,
    });
    
    if (!successful) {
      await call.say("Sorry, we couldn't connect your call. Please, try again later.");
      await call.hangup();
    }

    let connectToDifferentDeviceOnOne = async () => {
      let detectResult = await call.detectDigit({
        timeout: 10,
        digits: '1'
      });

      if (detectResult.successful) {
        let disconnectResult = await call.disconnect();
        if (disconnectResult.successful) {
          currentDevice = currentDevice == 0 ? 1 : 0;
          ({ successful } = await call.connect({
            type: 'phone',
            to: connectNumbers[currentDevice],
            timeout: 30,
          }));

          if (successful) {
            await connectToDifferentDeviceOnOne();
          } else {
            await call.say("Something went wrong while switching call. Goodbye.");
            await call.hangup();
          }
        }
      } else {
        await connectToDifferentDeviceOnOne();
      }
    }

    await connectToDifferentDeviceOnOne();
  }
})

consumer.run()
