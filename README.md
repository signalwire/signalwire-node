# SignalWire Client NodeJs

## Usage
Add a script tag referencing the SignalWire library:
```html
<script src="./bundle.js"></script>
```

Then instantiate SignalWire:
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
    onSessionReady: function (session) {
      // SignalWire session has established so you can now using all other methods..
      doSomethingAwesome()
    }
  }
})
```

## Events:

Subscribe to global events to get a notification when a service is updated.
If you do a subscription to both `signalwire` & `signalwire.calls`, your callbacks will be notify with the same data.

## Subscribe to all notifications from SignalWire:
```javascript
signalwire.on('signalwire', function(notificationType, notificationData){
  // Global notification. Inspect 'notificationType' to see which type of notification is (call || message || ..)
})
```

## Subscribe to all call-related events:
```javascript
signalwire.on('signalwire.calls', function(notificationType, notificationData){
  // Call notification. One of the active call has changed!
})
```

```javascript
signalwire.on('signalwire.messages', function(notificationType, notificationData){
  // Message notification. The state of one of your message has been updated!
})
```

## Methods available:

> Note: All subsequent methods will use the "signalwire" global variable and they must be used after "onSessionReady" callback.

### Messaging:

#### sendMessage:
```javascript
var params = {
  body: 'Hi Joe!',
  from: '+12622081318',
  to: '+15559999999',
  media: ['https://bit.ly/2N50Ysq', 'https://bit.ly/2Ki36zy']
}
_sw.sendMessage(params)
  .then(function (result) {
    // The SMS has been queued. You can retrieve the SMS data into "result"

    // You can also subscribe to this message notifications!
    result.onNotification(function(notificationType, notificationData){
      // Handle this notification in a different way of the global ones.
      // If you set this listener, the global one will not be notified.
    })
  })
  .catch(function (error) {
    // An error occured!
  })
```

#### getMessage:
```javascript
var params = {
  messageId: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX' // This value from the previous `sendMessage` Promise
}
signalwire.getMessage(params)
  .then(function (result) {
    // The SMS status is in "result.status"
    if (result.status === 'delivered') {
      // SMS has been sent! Update the UI properly...
    } else if (result.status === 'queued') {
      // SMS is still in queue. Check again with another `getMessage`
    } else if (result.status === 'failed') {
      // SMS failed to sent. Inspect the result object for the error message: `result`
    }
  })
  .catch(function (error) {
    // An error occured!
  })
```

### Calling:

#### Start a new call:
```javascript
var params = {
  from: '+12622081318',
  to: '+15559999999'
}
signalwire.createCall(params)
  .then(function (result) {
    // Call has started! Retrieve call UUID in "result.channel"

    // You can also subscribe to this call notifications!
    result.onNotification(function(notificationType, notificationData){
      // Handle this notification in a different way of the global ones.
      // If you set this listener, the global one will not be notified.
    })
  })
  .catch(function (error) {
    // An error occured!
  })
```

#### Hangup a call:
```javascript
var params = {
  callId: '9027985d-44c2-45f8-917e-8a9bec35398c' // UUID of the current call
}
signalwire.hangupCall(params)
  .then(function (result) {
    // Call has been hanged up!
  })
  .catch(function (error) {
    // An error occured!
  })
```

#### Play a .wav file into an active call:
```javascript
var params = {
  callId: '9027985d-44c2-45f8-917e-8a9bec35398c', // UUID of the current call
  url: 'http://www.kozco.com/tech/piano2.wav'
}
signalwire.playFileOnCall(params)
  .then(function (result) {
    // File successfully played!
  })
  .catch(function (error) {
    // An error occured!
  })
```

#### Play digits into an active call:
```javascript
var params = {
  callId: '9027985d-44c2-45f8-917e-8a9bec35398c', // UUID of the current call
  digits: '12345'
}
signalwire.playDigitsOnCall(params)
  .then(function (result) {
    // Digits successfully sent!
  })
  .catch(function (error) {
    // An error occured!
  })
```

#### Say something into an active call:
```javascript
var params = {
  callId: '9027985d-44c2-45f8-917e-8a9bec35398c', // UUID of the current call
  what: 'Hello, Welcome to SignalWire!',
  gender: 'male' // male || female
}
signalwire.sayOnCall(params)
  .then(function (result) {
    // Text successfully played!
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
