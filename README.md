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
> Note: host / login / password are required

```javascript
// Create a new instance
const client = new Verto({
  host: 'freeswitch.example.com:8082',
  login: '1008@freeswitch.example.com',
  password: 'your-super-password',
  userVariables: {
    // Custom properties: email/gravatar/userName that will be sent to remote peer on call or conference call.
  }
})

// ..add listeners you need
client.on('signalwire.ready', function(){
  // Client is now ready!
})

client.on('signalwire.error', function(error){
  // Handle the error!
})

client.on('signalwire.notification', function(notification){
  // ...
})

// connect the session!
client.connect()
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
After setup the events you need on the client do `connect()` to start the session:\
Return a **Promise**.
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

#### speedTest(bytes)
Perform a speed test and return upload/download values in Kbps.\
Return a **Promise**.

```javascript
client.speedTest(1024)
	.then(result => {
    // Print upload/download speed..
  })
  .catch(error => {
    // Error during speedTest!
  })
```

## Work with client devices:

#### refreshDevices()
Refresh the cache video/audio devices.\
Return a **Promise**.
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

## Set default audio settings:

#### setAudioSettings(settings)
Set default audio device and settings.
`settings` is an object that extends_audio [MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#Properties_of_audio_tracks) properties with:

| Key ||
| --- | --- |
| `micId` | Device ID to use by default |
| `micLabel` | Device label |

You should set the `micLabel` because Safari change the deviceId on each new page load. The client will try to find out the deviceId mapping the available devices by label.\
More info here: [https://webrtchacks.com/guide-to-safari-webrtc/](https://webrtchacks.com/guide-to-safari-webrtc/)

> All subsequent calls will inherit these settings.
```javascript
const settings = {
  micId: '55504f54e96b72e9a4066811867ac4b1924cb2a659b6e989d34438a3f0dcb912',
  micLabel: 'Internal Microphone (Built-in)',
  echoCancellation: true,
  noiseSuppression: true
}
client.setAudioSettings(settings)
```

#### disableMicrophone()
Disable the microphone for the client.
> All subsequent calls will **not** have outgoing audio by default.
```javascript
client.disableMicrophone()
```

#### enableMicrophone()
Enable the microphone for the client.
> All subsequent calls will have outgoing audio by default.
```javascript
client.enableMicrophone()
```

## Set default video settings:

#### setVideoSettings(settings)
Set default video device and settings.
`settings` is an object that extends video [MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#Properties_of_video_tracks) properties with:

| Key ||
| --- | --- |
| `camId` | Device ID to use by default |
| `camLabel` | Device label |

You should set the `camLabel` because Safari change the deviceId on each new page load. The client will try to find out the deviceId mapping the available devices by label.\
More info here: [https://webrtchacks.com/guide-to-safari-webrtc/](https://webrtchacks.com/guide-to-safari-webrtc/)

> All subsequent calls will inherit these settings.
```javascript
const settings = {
  camId: '745eb13036cd1aaed3566cb63af03e57778d14028c66972d9e12692f8c23f200',
  camLabel: 'FaceTime HD Camera (x:x)',
  width: 1280,
  height: 720,
  frameRate: 30
}
client.setVideoSettings(settings)
```

#### disableWebcam()
Disable the webcam for the client.
> All subsequent calls will **not** have outgoing video by default.
```javascript
client.disableWebcam()
```

#### enableWebcam()
Enable the webcam for the client.
> All subsequent calls will have outgoing video by default.
```javascript
client.enableWebcam()
```

## Set ICE Servers (STUN/TURN)

#### iceServers
Set default ICE servers to use. It accepts an array of [RTCIceServer](https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer).

```javascript
client.iceServers = [{
  urls: 'stun:stun.services.example.com',
  username: 'stunUsername',
  credential: 'stunCredential'
}]
```

#### iceServers()
Get ICE servers currently used by the client

```javascript
const servers = client.iceServers()
```

## Calling:

#### newCall()

The `newCall` method accept an object of parameters:
```javascript
const params = {
  // Required:
  destinationNumber: '3599',
  remoteCallerName: 'Joe Example', // Callee name
  remoteCallerNumber: 'joe@example.com', // Callee number or email
  callerName: 'J. Smith', // Caller name
  callerNumber: 'smith@example.com', // Caller number or email

  // Optional:
  localStream: MediaStream, // Use this stream instead of retrieving a new one. Useful if you have a stream from a canvas.captureStream() or from a screen share extension.
  localElementId: 'local-video', // HTMLMediaElement ID to which to attach the localStream
  remoteElementId: 'remote-video', // HTMLMediaElement ID to which to attach the remoteStream
  audio: boolean || MediaTrackConstraints, // Overrides client default audio settings. Could be a Boolean or an audio MediaTrackConstraints object.
  video: boolean || MediaTrackConstraints, // Overrides client default audio settings. Could be a Boolean or a video MediaTrackConstraints object.
  iceServers: RTCIceServer[], // Overrides client default iceServers
  useStereo: boolean,
  micId: '<deviceUUID>', // Overrides client default microphone device
  camId: '<deviceUUID>', // Overrides client default webcam device
  userVariables: {
    // Custom properties: email/gravatar/userName that will be sent to remote peer.
  },
  onNotification: function(message) {
    // Overrides the "signalwire.notification" callback for this Dialog so you can have different behaviour for each Dialog.
  }
}

const dialog = client.newCall(params)
```

> Note: with `localElementId` and `remoteElementId` the lib will attach the related stream to it but doesn't change the style attribute.
> It's up to you display or hide the HTMLMediaElement following the application logic. Use [dialogUpdate](https://github.com/signalwire/signalwire-client-js/wiki/Notification#dialogupdate) notification to detect dialog state changes and update the UI accordingly.

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

To build only ES5 or ES6 version
```
npm run build-es5
```

```
npm run build-es6
```

# Tests
To run tests:
```
npm test
```
