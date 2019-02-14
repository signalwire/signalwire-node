# SignalWire NodeJs

This library provides a client for the Signalwire LaML and REST services.

It allows you to create calls, send messages, and generate LAML responses.

[![npm version](https://badge.fury.io/js/signalwire.svg)](https://badge.fury.io/js/signalwire)

![Drone CI](https://ci.signalwire.com/api/badges/signalwire/signalwire-node/status.svg)

# Installation

Install the package using [NPM](https://www.npmjs.com/):
```bash
npm install signalwire
```

# Usage

In order to use the client you must set the environment variable `SIGNALWIRE_API_HOSTNAME`!

Puts in your `.env` file your SignalWire host, project and token:
```
SIGNALWIRE_API_HOSTNAME=changeme.signalwire.com
SIGNALWIRE_API_PROJECT=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
SIGNALWIRE_API_TOKEN=PTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Setup Client
```javascript
// Here we are using Project and Token from ENV
const RestClient = require('signalwire').RestClient
const client = new RestClient(process.env.SIGNALWIRE_API_PROJECT, process.env.SIGNALWIRE_API_TOKEN)
```

### Make Call
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

### Send Message
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

### Generating LaML
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

# Migration
Do you want to start using SignalWire in your current application? You can easily migrate the code with minimal changes!

Make sure you've set the env variable `SIGNALWIRE_API_HOSTNAME` as described in [Usage](#usage) and then:

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

## Running tests in Docker

A Dockerfile is provided for testing purposes. Run `docker run -it $(docker build -q .)` to execute the test suite.

# Copyright

Copyright (c) 2018 SignalWire Inc. See [LICENSE](https://github.com/signalwire/signalwire-node/blob/master/LICENSE) for further details.