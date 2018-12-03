# SignalWire Client JS

## Usage

If you are using the ES6 version:
```javascript
import { Verto } from 'signalwire-client-js'
```

Instead, if you are using the ES5 version add a script tag referencing the SignalWire library:
```html
<script src="./bundle.js"></script>
```

Then instantiate the client:
> Note: host / login / passwd are required for Verto

```javascript
const client = new Verto({
  host: 'freeswitch.example.com:8082',
  login: '1008@freeswitch.example.com',
  passwd: 'your-super-password'
})
```

## Subscribe to the client events:

To be notified of the internal events you need to subscribe to the events you need:

| Session Events | Description |
| --- | --- |
| `signalwire.ready` | The session has been established so all other methods can now be used. |

| Socket Events ||
| --- | --- |
| `signalwire.socket.open` | Socket is open but you are not yet authenticated |
| `signalwire.socket.close` | Socket is closing.. |
| `signalwire.socket.error` | Socket gave an error! |
| `signalwire.socket.message` | Client received a message from the socket. |

| mod_verto Events ||
| --- | --- |
| `signalwire.verto.dialogChange` | A dialog's state changed. Update the UI accordingly.. |
| `signalwire.verto.display` | Update the dialog UI with the informations received. |
| `signalwire.verto.info` | Need docs |
| `signalwire.verto.event` | Need docs |
| `signalwire.verto.pvtEvent` | Need docs |
| `signalwire.verto.clientReady` | All previously dialogs have been reattached. Note: FreeSWITCH 1.8+ only. |

### Examples:

```javascript
client.on('signalwire.socket.open', function(){
  // Do something when the socket has been opened!
})
```

```javascript
client.on('signalwire.socket.message', function(message){
  // Do something with the received message!
})
```

```javascript
client.on('signalwire.verto.dialogChange', function(dialog){
  // Update the UI when this dialog's state change:
  switch (dialog.state) {
    case 'new':
      // Setup the UI
      break
    case 'trying':
      // You are calling someone and he's ringing now
      break
    case 'ringing':
      // Someone is calling you
      break
    case 'active':
      // Dialog has become active
      break
    case 'hangup':
      // Dialog is over
      break
    case 'destroy':
      // Dialog has been destroyed
      break
  }
})
```

## Client methods available:

> Note: All subsequent methods will use the "client" variable and they must be used after `'signalwire.ready'` event.

#### connect()
After setup up all the events on the client do `connect()` to start the session:
```javascript
client.connect()
```

#### disconnect()
Hangup all the dialogs, unsubscribe all channels and close the socket connection:
```javascript
client.disconnect()
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
Property that returns an object with all video devices.
```javascript
const videoDevices = client.videoDevices
```
> videoDevices is keyed by deviceId.

#### audioInDevices
Property that returns an object with all audio input devices.
```javascript
const audioInDevices = client.audioInDevices
```
> The audioInDevices is keyed by deviceId.

#### audioOutDevices
Property that returns an object with all audio output devices.
```javascript
const audioOutDevices = client.audioOutDevices
```
> The audioOutDevices is keyed by deviceId.

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
  audio: true || false || MediaTrackConstraints, // https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#Properties_of_audio_tracks
  video: true || false || MediaTrackConstraints, // https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#Properties_of_video_tracks
  iceServers: true || false || RTCIceServer[], // https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer
  useStereo: true || false,
  micId: '<deviceUUID>', // Microphone device ID
  camId: '<deviceUUID>', // Webcam device ID
  userVariables: {
    // General user variables.. email/username
  },
  onChange: function(dialog) {
    // Override global "signalwire.verto.dialogChange" callback for this dialog..
  },
  onNotification: function(message) {
    // This callback will automatically subscribe the client to a liveArray for this dialog so here you'll get the liveArray messages like bootObj - add - modify - del for the current conference call.
  },
  onUserMediaError: function(error) {
    // Permission denied or invalid audio/video params
  }
}
const dialog = client.newCall(params)
```

### Anatomy of a dialog:

#### dialog.direction
Can be `inbound` or `outbound`

#### dialog.state
Possible states are:
* new
* requesting
* trying
* recovering
* ringing
* answering
* early
* active
* held
* hangup
* destroy
* purge

#### dialog.localStream
Local stream of the dialog. Use it in a video element to display the local peer:

```javascript
var video = document.getElementById('localVideo')
video.srcObject = dialog.localStream
```

#### dialog.remoteStream
Remote stream of the dialog. Use it in a video element to display the remote peer:

```javascript
var video = document.getElementById('remoteVideo')
video.srcObject = dialog.remoteStream
```

#### getter dialog.audioState
Return the audio state of the dialog `true` means active (unmuted), `false` means disable (muted).

#### setter dialog.audioState = state
Set the audio state of the dialog:<br/>
* `true` or `'on'` means unmute<br/>
* `false` or `'off'` means mute<br/>
* `'toggle'` will toggle the current state

#### getter dialog.videoState
Return the video state of the dialog `true` means active (unmuted), `false` means disable (muted).

#### setter dialog.videoState = state
Set the video state of the dialog:<br/>
* `true` or `'on'` means unmute<br/>
* `false` or `'off'` means mute<br/>
* `'toggle'` will toggle the current state


### Methods:
> All these methods are available on a Dialog object and permit to interact with the dialog:

#### hangup()
Hangup the dialog
```javascript
dialog.hangup()
```

#### transfer()
Transfer the dialog to the supplied extension
```javascript
dialog.transfer(extension)
```

#### hold()
Hold the dialog
```javascript
dialog.hold()
```

#### unhold()
Unhold the dialog
```javascript
dialog.unhold()
```

#### toggleHold()
Toggle the hold state for the dialog
```javascript
dialog.toggleHold()
```


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
