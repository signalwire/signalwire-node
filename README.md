# SignalWire Client JS

## Usage

If you are using the ES6 version:
```javascript
import { Verto } from 'signalwire-client-js'
```

If you are using the ES5 version add a script tag referencing the SignalWire library:
```html
<script src="./bundle.js"></script>
```

Then instantiate the client:
> Note: host / login / password are required for Verto

```javascript
const client = new Verto({
  host: 'freeswitch.example.com:8082',
  login: '1008@freeswitch.example.com',
  password: 'your-super-password'
})
```

## Subscribe to the client events:

To be notified of the internal events you need to subscribe to the events you need:

| Session Events | Description |
| --- | --- |
| `signalwire.ready` | The session has been established so all other methods can now be used. |
| `signalwire.error` | Error dispatch at the session level. |
| `signalwire.notification` | A notification from SignalWire. It can refer to a dialog, a conference update or generic events. See the examples below |

| Socket Events ||
| --- | --- |
| `signalwire.socket.open` | Socket is open but you are not yet authenticated |
| `signalwire.socket.close` | Socket is closing.. |
| `signalwire.socket.error` | Socket gave an error! |
| `signalwire.socket.message` | Client received a message from the socket. |

### Examples:

```javascript
client.on('signalwire.ready', function(){
  // Session is ready!
})
```

```javascript
client.on('signalwire.notification', function(notification){
  switch (notification.type) {
    case 'dialogUpdate':
      // A dialog's state changed. Update the UI accordingly..
      break
    case 'conferenceUpdate':
      // Live notification from the conference: start talking / video floor changed / audio or video state changes / a participant joins or leaves and so on..
      break
    case 'participantData':
      // Caller's data like name and number to update the UI. In case of a conference call you will get the name of the room and the extension.
      break
    case 'vertoClientReady':
      // All previously dialogs have been reattached. Note: FreeSWITCH 1.8+ only.
      break
    case 'userMediaError':
      // Permission denied or invalid audio/video params on `getUserMedia`
      break
    case 'event':
      // Generic notification received
      break
  }
})
```

```javascript
client.on('signalwire.socket.open', function(){
  // Do something when the socket has been opened!
})
```

## Client methods:

#### connect()
After setup up all the events on the client do `connect()` to start the session:
```javascript
client.connect()
```

> Note: All subsequent methods must be used after `'signalwire.ready'` event.

#### disconnect()
Close the WebSocket connection:
```javascript
client.disconnect()
```

#### logout()
Hangup all the dialogs, remove subscriptions to the channels and then disconnect the client:
```javascript
client.logout()
```

#### supportedResolutions()
Returns a promise with all supported resolution:
```javascript
client.supportedResolutions()
  .then(function(resolutions){
    // ...
  })
  .catch(function(error){
    // Error checking resolution
  })
```

#### refreshDevices()
Refresh the cache video/audio devices
```javascript
client.refreshDevices()
```

#### videoDevices
Returns all video devices.
```javascript
const videoDevices = client.videoDevices
```
> videoDevices is keyed by deviceId.

#### audioInDevices
Returns all audio input devices.
```javascript
const audioInDevices = client.audioInDevices
```
> audioInDevices is keyed by deviceId.

#### audioOutDevices
Returns all audio output devices.
```javascript
const audioOutDevices = client.audioOutDevices
```
> audioOutDevices is keyed by deviceId.

## Calling:

#### newCall()

The `newCall` method accept an object of parameters:
```javascript
const params = {
  // Required:
  destination_number: '3599',
  remote_caller_id_name: 'Joe Example',
  remote_caller_id_number: 'joe@example.com',
  caller_id_name: 'J. Smith',
  caller_id_number: 'smith@example.com',

  // Optional:
  localStream: MediaStream, // Use this stream instead of retrieving a new one. Useful if you have a stream from a canvas.captureStream() or from a screen share extension.
  audio: boolean || MediaTrackConstraints, // https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#Properties_of_audio_tracks
  video: boolean || MediaTrackConstraints, // https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#Properties_of_video_tracks
  iceServers: boolean || RTCIceServer[], // https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer
  useStereo: boolean,
  micId: '<deviceUUID>', // Microphone device ID
  camId: '<deviceUUID>', // Webcam device ID
  userVariables: {
    // General user variables.. email/username
  },
  onNotification: function(message) {
    // Overrides the `signalwire.notification` callback for this Dialog so you can have different behaviour for each Dialog.
  }
}
const dialog = client.newCall(params)
```

See [Dialog](https://github.com/signalwire/signalwire-client-js/wiki/Dialog) to discover all the properties and methods available on a Dialog object.

# Development setup
To start working you need a few things:
- Install [Node.js](https://nodejs.org/en/)
- Clone the repository
- Install dependencies
```
cd signalwire-client-js
npm install
```

# Build versions
This package can build both ES5 and ES6 version of the client.

Run `build` to create them both under `dist/` folder:
```
npm run build
```

# Tests
To run tests:
```
npm test
```
