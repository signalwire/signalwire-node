# SignalWire Client NodeJs

## Usage
Add a script tag referencing the SignalWire library:
```html
<script src="./bundle.js"></script>
```

### Methods available:

The first thing you need to is to instantiate SignalWire:
> Note: host / project / token are required

```javascript
var signalwire = new SignalWire({
  host: 'demo.signalwire.com',
  project: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
  token: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  callbacks: {
    onSocketOpen: function (session) {
      // The socket connection is open but you are not yet authenticated with the SignalWire system
    },
    onSocketClose: function (session) {
      // The socket connection is close
    },
    onSocketError: function (session, error) {
      // The socket returns error. Inspect the "error" variable
    },
    onSessionReady: async function (session) {
      // SignalWire session has established so you can now using all other methods..
      doSomethingAwesome()
    }
  }
})
```

> Note: All subsequent methods will use the "signalwire" global variable and they must be used after "onSessionReady" callback.

#### sendSms:
```javascript
var text = "Hi Joe!"
var from = "+12622081318"
var to = "+15559999999"
signalwire.sendSms(text, from, to)
  .then(function (bladeObj) {
    // The SMS has been queued. You can retrieve the SMS data into "bladeObj.response.result.result"
    var smsId = bladeObj.response.result.result.id
  })
  .catch(function (error) {
    // An error occured!
  })
```

#### statusSms:
```javascript
var smsId = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX' // This value from the previous `sendSms` Promise
signalwire.statusSms(smsId)
  .then(function (bladeObj) {
    // The SMS status is in bladeObj.response.result.result.status variable
    if (bladeObj.response.result.result.status === 'delivered') {
      // SMS has been sent! Update the UI properly...
    } else if (bladeObj.response.result.result.status === 'queued') {
      // SMS is still in queue. Check again with another `statusSms`
    } else if (bladeObj.response.result.result.status === 'failed') {
      // SMS failed to sent. Inspect the result object for the error message: `bladeObj.response.result.result`
    }
  })
  .catch(function (error) {
    // An error occured!
  })
```

# Development setup
To build and run this app locally you will need a few things:
- Install [Node.js](https://nodejs.org/en/)
- Clone the repository
- Install dependencies
```
cd signalwire-client-js
npm install
```

# Tests
To run tests:
```
npm test
```
