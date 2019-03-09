# SignalWire Node.js

This package provides a NodeJS client for the Signalwire services.
It allows you to create calls, send messages, and generate LaML responses.

## Contents
* [Getting Started](#getting-started)
* [RestClient](#restclient)
* [LaML](#laml-client)
* [RelayClient](#relayclient)

## Getting Started

Install the package using [NPM](https://www.npmjs.com/):
```bash
npm install signalwire
```

And set the required environment variables!
Puts in your `.env` file your SignalWire `host`, `project` and `token`:
```
SIGNALWIRE_API_HOSTNAME=changeme.signalwire.com
SIGNALWIRE_API_PROJECT=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
SIGNALWIRE_API_TOKEN=PTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## RestClient

With `RestClient` you can create calls, send SMS/MMS, manage Queues, Faxes etc. \
Read more on our [REST API Documentation](https://docs.signalwire.com/topics/laml-api/?javascript#laml-rest-api).
```javascript
// Here we are using Project and Token from ENV
const RestClient = require('signalwire').RestClient
const client = new RestClient(process.env.SIGNALWIRE_API_PROJECT, process.env.SIGNALWIRE_API_TOKEN)
```

#### Make Call
```javascript
client.calls.create({
  to: '+19999999999', // Call this number
  from: '+18888888888', // From a valid SignalWire number
  url: 'https://example.com/laml/voice.xml' // Valid LaML
}).then(call => {
  process.stdout.write('Call ID: ' + call.sid)
}).catch(error => {
  // Inspecting error...
})
```

#### Send Message
```javascript
client.messages.create({
  body: 'Welcome to SignalWire!',
  to: '+19999999999', // Text this number
  from: '+18888888888' // From a valid SignalWire number
}).then(message => {
  process.stdout.write('Message ID: ' + message.sid)
}).catch(error => {
  // Inspecting error...
})
```

## LaML Client
`LaML` is the language used by SignalWire to determine how the phone numbers in your account react during calls or text messages.\
Read more about LaML [here](https://docs.signalwire.com/topics/laml-xml/?javascript#what-is-laml)!

```javascript
const RestClient = require('signalwire').RestClient
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


### Migration
Do you want to start using SignalWire in your current application? You can easily migrate the code with minimal changes!

Make sure you've set the env variable `SIGNALWIRE_API_HOSTNAME` as described in [Getting Started](#getting-started) and then:

To use the Rest client:
```javascript
// Replace these lines:
const twilio = require('twilio')
const client = new twilio(sid, token)

// With ...
const signalwire = require('signalwire')
const client = new signalwire.RestClient(project, token)

// Now use client variable like you did before!
```
> For calls and messages you should also change the `from` numbers with a valid SignalWire number!

To generate `LaML`:

```javascript
// Replace these lines..
const twilio = require('twilio')
const response = new twilio.twiml.VoiceResponse()

// With ..
const signalwire = require('signalwire')
const response = new signalwire.RestClient.LaML.VoiceResponse()

// Now use response like you did before!
response.say('Hey, Welcome at SignalWire!')
```

## RelayClient [_WIP_]

With `RelayClient` you can control calls in real time. \
Read more on our [Relay Documentation](https://docs.signalwire.com/).
```javascript
const { RelayClient } = require('signalwire')
const client = new RelayClient({
  host: process.env.SIGNALWIRE_API_HOSTNAME,
  project: process.env.SIGNALWIRE_API_PROJECT,
  token: process.env.SIGNALWIRE_API_TOKEN
})

client.on('signalwire.ready', session => {
  // Your client is now ready!
})

client.connect()
```

#### Make Call
```javascript
const asyncFn = async () => {
  const call = await client.calling.makeCall({ type: 'phone', from: '+18888888888', to: '+19999999999' })
    .catch(error => {
      // An error occured creating the call!
    })
  if (call) {
    call.on('answered', call => {
      // Remote party answered the call
    })
    call.begin()
      .catch(error => {
        // An error occured starting the call!
      })
  }
}
```

### Build versions
To build the CommonJS version of the package:

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
