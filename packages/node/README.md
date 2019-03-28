[![npm version](https://badge.fury.io/js/%40signalwire%2Fnode.svg)](https://badge.fury.io/js/%40signalwire%2Fnode)

# SignalWire Node.js

This package provides a NodeJS client for the Signalwire services.
It allows you to create calls, send messages, and generate LaML responses.

## Contents
* [Getting Started](#getting-started)
* [Relay](#relay)
* [LaML](#laml)

## Getting Started

Install the package using [NPM](https://www.npmjs.com/):
```bash
npm install @signalwire/node
```

## Relay

With `RelayClient` you can control calls in real time. \
Read more on our [Relay Documentation](https://docs.signalwire.com/topics/relay).
```javascript
const { RelayClient } = require('@signalwire/node')
const client = new RelayClient({
  host: 'example.signalwire.com',
  project: 'your-project',
  token: 'your-token'
})

client.on('signalwire.ready', session => {
  // Your client is now ready!
})

client.connect()
```

#### Make Call
```javascript
async function main(numberToCall) {
  const call = await client.calling.newCall({ type: 'phone', from: '+18991112222', to: numberToCall })
  call.begin() // Start the call!
}
main('+18991113333').catch(console.error)
```

## LaML

### RestClient

With `RestClient` you can create calls, send SMS/MMS, manage Queues, Faxes etc. \
Read more on our [REST API Documentation](https://docs.signalwire.com/topics/laml-api/?javascript#laml-rest-api).
```javascript
const { RestClient } = require('@signalwire/node')
const client = new RestClient('your-project', 'your-token', { signalwireSpaceUrl: 'example.signalwire.com' })
```

You can alternatively use the environment variable to set the Space URL:\
Put the Space URL in your `.env` file:
```
SIGNALWIRE_SPACE_URL=example.signalwire.com
```

And then `signalwireSpaceUrl` will be pulled from the ENV for you:
```javascript
const { RestClient } = require('@signalwire/node')
const client = new RestClient('your-project', 'your-token')
```

#### Make Call
```javascript
client.calls.create({
  to: '+19999999999', // Call this number
  from: '+18888888888', // From a valid SignalWire number
  url: 'https://example.com/laml/voice.xml' // Valid LaML
}).then(call => {
  process.stdout.write('Call ID: ' + call.sid)
}).catch(console.error)
```

#### Send Message
```javascript
client.messages.create({
  body: 'Welcome to SignalWire!',
  to: '+19999999999', // Text this number
  from: '+18888888888' // From a valid SignalWire number
}).then(message => {
  process.stdout.write('Message ID: ' + message.sid)
}).catch(console.error)
```

### LaML Client
`LaML` is the language used by SignalWire to determine how the phone numbers in your account react during calls or text messages.\
Read more about LaML [here](https://docs.signalwire.com/topics/laml-xml/?javascript#what-is-laml)!

```javascript
const { RestClient } = require('@signalwire/node')
const response = new RestClient.LaML.VoiceResponse()
response.dial({ callerId: '+18888888888' }, '+19999999999')
response.say("Welcome to SignalWire!")
process.stdout.write(response.toString())
```

LaML output:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="+18888888888">+19999999999</Dial>
  <Say>Welcome to SignalWire!</Say>
</Response>
```


## Migration
Do you want to start using SignalWire in your current application? You can easily migrate the code with minimal changes!

To use the Rest client:
```javascript
// Replace these lines:
const twilio = require('twilio')
const client = new twilio(sid, token)

// With ...
const { RestClient } = require('@signalwire/node')
const client = new RestClient('your-project', 'your-token', { signalwireSpaceUrl: 'your-space.signalwire.com' })

// Now use client variable like you did before!
```
> For calls and messages you should also change the `from` numbers with a valid SignalWire number!

To generate `LaML`:

```javascript
// Replace these lines..
const twilio = require('twilio')
const response = new twilio.twiml.VoiceResponse()

// With ..
const { RestClient } = require('@signalwire/node')
const response = new RestClient.LaML.VoiceResponse()

// Now use response like you did before!
response.say('Hey, Welcome at SignalWire!')
```

### Build versions
To build the lib:

```
npm run clean-build
```

### Tests

We provide tests to run with:
```
npm run test
```
<!---
A Dockerfile is provided for testing purposes. Run `docker run -it $(docker build -q .)` to execute the test suite.
-->

## Copyright

Copyright (c) 2018 SignalWire Inc. See [LICENSE](https://github.com/signalwire/signalwire-node/blob/master/LICENSE) for further details.
