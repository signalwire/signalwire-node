# SignalWire React Native

This package provides a client for the Signalwire services.

## Contents
* [Getting Started](#getting-started)
* [WebRTC Engine](#webrtc-engine)
* [Relay](#setup)

## Getting Started

Install the package using [NPM](https://www.npmjs.com/):
```bash
npm install @signalwire/react-native
```

## WebRTC Engine

Our package `@signalwire/react-native` depends on [react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc) and will try to install it automatically for you in the `postinstall` script.\
It's possible that an error will occur during the linking process of the native libraries. If your app does not compile, follow these steps to troubleshoot:

- [iOS](https://github.com/react-native-webrtc/react-native-webrtc/blob/master/Documentation/iOSInstallation.md)
- [Android](https://github.com/react-native-webrtc/react-native-webrtc/blob/master/Documentation/AndroidInstallation.md)

> Make sure to check the app permissions in `AndroidManifest.xml` and `Info.plist` to access the device camera and microphone!

## Relay

If you are using the ES6 version:
```javascript
import { Relay } from '@signalwire/react-native'
```

Then instantiate the client:
> Note: host / project / token are required

Make sure to subscribe to the `signalwire.notification` of type `refreshToken` to know when the client needs to refresh you JWT to keep the session live!
For more JWT info read ...

```javascript
// Create a new instance
const client = new Verto({
  host: 'example.signalwire.com',
  project: 'your-project',
  token: 'a-valid-jwt'
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
    case 'refreshToken':
      // The JWT is going to expire. Refresh it and then update the client using refreshToken('new-jwt') method to keep your session live.
      break
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

#### resolutions
Returns all supported resolutions by the host.
```javascript
const resolutions = client.resolutions
```

#### refreshResolutions()
Refresh the list of supported resolution:
```javascript
client.refreshResolutions()
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

## Configure ICE Servers (STUN/TURN)

#### set iceServers
Set default ICE servers to use. It accepts an array of [RTCIceServer](https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer).

```javascript
client.iceServers = [{
  urls: 'stun:stun.services.example.com',
  username: 'stunUsername',
  credential: 'stunCredential'
}]
```

#### get iceServers
Get ICE servers currently used by the client

```javascript
const servers = client.iceServers
```

## Configure default DOM elements to attach the MediaStreams

### Local

#### set localElement
Set default video/audio element to attach the `localStream`. Possible values are `string` (must be the element's ID), [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement), or a `Function` that returns a DOM element.

```javascript
// Using a string
client.localElement = 'localVideoId'

// Using a DOM element
client.localElement = document.getElementById('localVideoId')

// Using a Function
client.localElement = function() {
  // Create element or do something and then..
  return element
}
```

#### get localElement
Get the default element used by the client.

```javascript
const elem = client.localElement
```

### Remote

#### set remoteElement
Set default video/audio element to attach the `remoteStream`. Possible values are `string` (must be the element's ID), [HTMLMediaElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement), or a `Function` that returns a DOM element.

```javascript
// Using a string
client.remoteElement = 'remoteVideoId'

// Using a DOM element
client.remoteElement = document.getElementById('remoteVideoId')

// Using a Function
client.remoteElement = function() {
  // Create element or do something and then..
  return element
}
```

#### get remoteElement
Get the default element used by the client.

```javascript
const elem = client.remoteElement
```

## Calling:

#### newCall(options)

The `newCall` method accept an Object with the following properties:

| property | required | type | default | description |
| --- | --- | --- | --- | --- |
| destinationNumber | :heavy_check_mark: | `string` | "" | Extension to call |
| remoteCallerName | :heavy_check_mark: | `string` | "Outbound Call" | Callee name |
| remoteCallerNumber | :heavy_check_mark: | `string` | "" | Callee number or email |
| callerName | :heavy_check_mark: | `string` | "" | Caller name |
| callerNumber | :heavy_check_mark: | `string` | "" | Caller number or email |
| localStream | - | `MediaStream` | `null` | Use this stream instead of retrieving a new one. Useful if you have a stream from a canvas.captureStream() or from a screen share extension |
| localElement | - | `string` | `null` | Overrides client default `localElement` |
| remoteElement | - | `string` | `null` | Overrides client default `remoteElement` |
| audio | - | `boolean` or audio [MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#Properties_of_audio_tracks) | `true` | Overrides client default audio settings |
| video | - | `boolean` or video [MediaTrackConstraints](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#Properties_of_video_tracks) | `false` | Overrides client default video settings |
| iceServers | - | Array of [RTCIceServer](https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer) | [] | Overrides client default iceServers |
| useStereo | - | `boolean` | true | |
| camId | - | `string` | `null` | Overrides client default webcam device |
| micId | - | `string` | `null` | Overrides client default microphone device |
| userVariables | - | `object` | `{}` | Custom properties like email/gravatar/userName that will be sent to remote peer. |
| onNotification | - | `Function` | `null` | Overrides the `signalwire.notification` callback for this Dialog so you can have different behaviour for each Dialog |

> Note: with `localElement` and `remoteElement` the lib will attach the related stream to them but doesn't change the style attribute.
> It's up to you display or hide the HTMLMediaElement following the application logic. Use [dialogUpdate](https://github.com/signalwire/signalwire-client-js/wiki/Notification#dialogupdate) notification to detect dialog state changes and update the UI accordingly.

Example:
```javascript
const params = {
  destinationNumber: '3599',
  remoteCallerName: 'Joe Example',
  remoteCallerNumber: 'joe@example.com',
  callerName: 'J. Smith',
  callerNumber: 'smith@example.com'
}

const dialog = client.newCall(params)
```

See [Dialog](https://github.com/signalwire/signalwire-client-js/wiki/Dialog) to discover all the properties and methods available on a Dialog object.
