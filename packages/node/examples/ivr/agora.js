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
const RelayConsumer = SignalWire.RelayConsumer

// const client = new RelayClient({
//   host: cfg.signalwireHost,
//   project: cfg.signalwireProject,
//   token: cfg.signalwireToken
// })

var ACTIVE_CALLS = new Array()
var myClient;

const consumer = new RelayConsumer({
  host: cfg.signalwireHost,
  project: cfg.signalwireProject,
  token: cfg.signalwireToken,

  contexts: ['agora'],
  ready: async ({ client }) => {
    myClient = client;
  },
  teardown: (consumer) => {
    console.log('teardown now and close.')
  },
  onTask: async (message) => {
    console.log('New task:', message)
  },
  onIncomingMessage: async (message) => {
    console.log('Inbound message', message.id, message.from, message.to)
  },
  onMessageStateChange: async (message) => {
    console.log('Message state changed', message.id, message.state)
  },
  onIncomingCall: async (call) => {
    console.log('Inbound call', call.id, call.from, call.to)
    const answerResult = await call.answer()
    if (!answerResult.successful) {
      console.error('Answer Error')
      return
    }
    const collect = { initial_timeout: 10, digits: { max: 3, digit_timeout: 5 } }
    const prompt = await call.promptTTS(collect, { text: 'Welcome at SignalWire! Please, enter your PIN' })
    if (prompt.successful) {
      await call.playTTS({ text: `You entered: ${prompt.result}. Thanks and good bye!` })
    } else {
      await call.playTTS({ text: 'Errors during prompt.' })
    }
    await call.hangup()
  }
})

consumer.run()

// http interface
const express = require('express')
const app = express()
const port = cfg.httpPort

app.use(express.static('public'))
app.get('/getWebsocketPort', (req, res) => {
  const data = {port: cfg.websocketPort}
  res.send(JSON.stringify(data))
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))


//websocket interface
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: cfg.websocketPort });
wss.on('connection', function connection(ws, req) {
  const ip = req.connection.remoteAddress;
  ws.on('message', function incoming(message) {
    console.log(message)
    try {
      const cmd = JSON.parse(message)

      if (cmd.method == "call") {
        makeCall(cmd)

      }
    } catch (e) {
      console.error("parse error:", e)
    }
  })
})

function makeCall(cmd) {
  console.log("relay call", cmd)

  const leg = myClient.calling.dial({ type: 'phone', from: '+1xxx', to: '+1yyy' }).catch(error => {
    console.error('createCall error:', error)
  })

  leg.on('created', call => {
    console.log(`\t ${call.id} state from ${call.prevState} to ${call.state}`, '\n')
  })
  .on('ringing', call => {
    console.log(`\t ${call.id} state from ${call.prevState} to ${call.state}`, '\n')
  })
  .on('answered', call => {
    console.log(`\t ${call.id} state from ${call.prevState} to ${call.state}`, '\n')
  })
  .on('ending', call => {
    console.log(`\t ${call.id} state from ${call.prevState} to ${call.state}`, '\n')
  })
  .on('ended', call => {
    console.log(`\t ${call.id} state from ${call.prevState} to ${call.state}`, '\n')
    _init()
  })

  leg.on('disconnected', call => {
    console.log(`\t ${call.id} has been disconnected!`, '\n')
  })
  .on('connecting', call => {
    console.log(`\t ${call.id} trying to connecting..`, '\n')
  })
  .on('connected', call => {
    console.log(`\t ${call.id} has been connected with ${call.peer.id}!`, '\n')
  })
  .on('failed', call => {
    console.log(`\t ${call.id} failed to connect!`, '\n')
  })

  leg.on('record.recording', params => {
    console.log(`\t Record state changed for ${params.call_id} in ${params.state} - ${params.control_id}`)
  })
  leg.on('record.paused', params => {
    console.log(`\t Record state changed for ${params.call_id} in ${params.state} - ${params.control_id}`)
  })
  leg.on('record.finished', params => {
    console.log(`\t Record state changed for ${params.call_id} in ${params.state} - ${params.control_id}`)
  })
  leg.on('record.no_input', params => {
    console.log(`\t Record state changed for ${params.call_id} in ${params.state} - ${params.control_id}`)
  })
}
