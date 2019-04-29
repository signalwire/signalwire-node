var env = process.env.NODE_ENV || 'development'
var cfg = require('./config.'+ env);

// SignalWire
console.log("starting signalwire node ...")
console.log(cfg)

var signalwire_package = '@signalwire/node'

if (cfg.signalwire_package) {
  signalwire_package = cfg.signalwire_package // allow overwrite with '../..' on dev
}

const SignalWire = require(signalwire_package)
const RelayClient = SignalWire.RelayClient

const client = new RelayClient({
  host: cfg.signalwireHost,
  project: cfg.signalwireProject,
  token: cfg.signalwireToken
})

var ACTIVE_CALLS = new Array()

async function receiver() {
  try {
    const context = "relay-test";

    await client.calling.onInbound(context, async call => {
      console.warn(`\tInbound call on "${call.context}"`, `from: ${call.from} - to: ${call.to}\n`)
      await call.answer().catch(console.error)

      var account = null
      var password = null

      call.on('collect', async (call, params) => {
        console.log(`\t ${call.id} collect result: \n`, params)

        if (!account) {
          account = params.params.digits;
          await call.playTTSAndCollect({
            initial_timeout: 15,
            digits: { max: 5, terminators: "#*", digit_timeout: 5 }
          }, {text: "Plese input your password, end with pound"}).then(result => {
            console.log("collect started", result)
          }).catch(error => {
            console.error(error)
          })
        } else {
          password = params.params.digits;
          console.log("account: ", account);
          console.log("password: ", password);

          call.on('play.finished', async (call, params) => {
            await call.hangup();
          })

          await call.playTTS({ text: "Good. Thank you, bye"} );
        }
      })

      call.on('play.finished', async (call, params) => {
        console.log(`\t ${call.id} play finished: \n`, params)

        // make sure it doesn't be called again
        call.off('play.finished')

        await call.playTTSAndCollect({
          initial_timeout: 15,
          digits: { max: 5, terminators: "#*", digit_timeout: 5 }
        }, {text: "Plese input your account, end with pound"}).then(result => {
          console.log("collect started", result)
        }).catch(error => {
          console.error(error)
        })
      })

      await call.playTTS({ text: "Welcome to SignalWire"} ).then(() => {
        console.log(`\t TTS received?`)
      })
    })
    console.log(`Listener for ${context} started..\n`)
  } catch (error) {
    console.error('onInbound error:', error)
  } finally {
  }
}

client.on('signalwire.ready', session => {
  // Your client is now ready!
  console.log("ready!")
  receiver(); // start listening for incomding calls
})

client.connect()
