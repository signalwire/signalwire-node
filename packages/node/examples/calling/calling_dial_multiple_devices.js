const { RelayConsumer } = require('../..');

let consumer = new RelayConsumer({
  project: process.env.PROJECT,
  token: process.env.TOKEN,
  ready: async ({ client }) => {
    // client.__logger.setLevel(client.__logger.levels.DEBUG)

    let result = await client.calling.dial([
        {
          type: 'phone',
          from: '<YOUR_FROM_PHONE_NUMBER_1>',
          to: '<YOUR_TO_PHONE_NUMBER_1>',
          timeout: 30,
        },
        {
          type: 'phone',
          from: '<YOUR_FROM_PHONE_NUMBER_2>',
          to: '<YOUR_TO_PHONE_NUMBER_2>',
          timeout: 30,
        }, 
      ]);

    console.log(result);
    if (result.successful) {
      console.log('HERE');
      await result.call.connect({
        type: 'sip',
        from: '<YOUR_FROM_SIP_ENDPOINT>',
        to: '<YOUR_TO_SIP_ENDPOINT>'
      });
    }
  },
  contexts: ['default']
});

consumer.run();