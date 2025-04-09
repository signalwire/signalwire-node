# Browser WebRTC Overrides

Developer are allowed to provide custom WebRTC implementations. Note that if you decide to override any implementation you're required to override all.
The SDK completely replaces the implementation for that client instance, and it not going to fallback to the default implementation on any case.

## Usage

```javascript
// make sure to initialize any dependency of the WebRTC implementations,
// before you create the new client instance...

initWebRTCDependencies().then(() => {
  const client = new Relay({
    host: window.__host,
    project: document.getElementById('project').value,
    token: document.getElementById('token').value,
    // should return an instance of the RTCPeerConnection
    RTCPeerConnection: (params) => {
      return new RTCPeerConnection(params)
    },
    // should return a promise of MediaStream
    getUserMedia: (params) => {
      console.log('Calling custom getUserMedia')
      return navigator.mediaDevices.getUserMedia(params)
    },
    // should return a promise of MediaStream
    getDisplayMedia: (params) => {
      console.log('Calling custom getDisplayMedia')
      return navigator.mediaDevices.getDisplayMedia(params)
    },
    // should return a promise of MediaDeviceInfo[]
    enumerateDevices: () => {
      console.log('Calling custom enumerateDevices')
      return navigator.mediaDevices.enumerateDevices()
    },
    // should return a MediaTrackSupportedConstraints
    getSupportedConstraints: () => {
      console.log('Calling custom getSupportedConstraints')
      return navigator.mediaDevices.getSupportedConstraints()
    },
  })

  client.on('signalwire.ready', () => {
    // should wait the SDK initialization before allowing any user interaction that requires the SDK

    // expose the client instance
    windows.__swClient = client
  })
})
```
