# Browser WebRTC Overrides

Developers are allowed to provide custom WebRTC implementations. Note that if you decide to override any implementation you're required to override all except the `getSupportedConstraints`.
The SDK will replace the implementation for that client instance, and it not going to fallback to the default implementation when a override is defined. 

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
      const peerConnection = new RTCPeerConnection(params)
      // customize the peer connection if needed
      return peerConnection
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
    // should return true if the stream is valid
    streamIsValid: (stream) => !!stream,
    // this should set the `srcObject` in element referenced by tag(HTMLElement or elementId)
    attachMediaStream: (tag, stream) => {},
  })

  client.on('signalwire.ready', () => {
    // should wait the SDK initialization before allowing any user interaction that requires the SDK

    // expose the client instance
    windows.__swClient = client
  })
})
```

## Citrix Example

```javascript
client = new Relay({
  host: 'space.signalwire.com',
  project: document.getElementById('project').value,
  token: document.getElementById('token').value,
  RTCPeerConnection: (params) => {
    const peerConnection = new vdiCitrix.CitrixPeerConnection(params)
    peerConnection.usingAsyncOnly = true
    peerConnection.ontrack = (event) => {
      // intercepts the ontrack event an emits an adapted payload 
      const track = event.track
      console.log(
        '[############# CtxOrrides]: onTrack() entering for ' + track.kind,
        track,
      )

      if (track.kind === 'audio') {

        remoteAudio = document.getElementById('remoteVideo')

        vdiCitrix.mapAudioElement(remoteAudio)

        remoteAudio
          .setSinkId(audioOutputVDI.deviceId)
          .then(() => {
            vdiCitrix
              .createMediaStreamAsync([track]) // Create a  new stream using Citrix
              .then((remoteAudioStream) => {
                remoteStream = remoteAudioStream
                if (trackListener && typeof trackListener === 'function') {
                  // emits the adapted payload
                  trackListener({streams: [remoteStream]})
                }
              })
              .catch((e) => {
                console.log(
                  '[############# CtxOrrides]: onTrack failed to createMediaStreamAsync() for audio with error:',
                  e,
                )
              })
          })
          .catch((e) =>
            console.log(
              '[############# CtxOrrides]: onTrack failed to setSinkId() for audio with error:',
              e,
            ),
          )
      }
    }

    // Peer Connection listeners must be implemented or signaling won't work
    peerConnection.onicecandidate = (event) => {
      console.log('[############# CtxOrrides]: onicecandidate', event)
      peerConnection.onicecandidateOverride(event)
    }
    peerConnection.oniceconnectionstatechange = (event) => {
      console.log(
        '[############# CtxOrrides]: oniceconnectionstatechange',
        event,
      )
    }
    peerConnection.onicegatheringstatechange = (event) => {
      console.log(
        '[############# CtxOrrides]: onicegatheringstatechange',
        event,
      )
    }
    peerConnection.onsignalingstatechange = (event) => {
      console.log('[############# CtxOrrides]: onsignalingstatechange', event)
    }

    // Citrix SDK don't support addEventListener.But we need to implement the track event adapter 
    peerConnection.addEventListener = (eventName, cb) => {
      if (eventName === 'track') {
        notifyTrackListenner(cb)
      }
    }
    return peerConnection
  },
  getUserMedia: (params) => {
    return new Promise((res, rej) => {
      vdiCitrix
        .getUserMedia(params)
        .then((stream) => {
          res(stream)
        })
        .catch(rej)
    })
  },
  getDisplayMedia: (params) => {
    return vdiCitrix.getDisplayMedia(params)
  },
  enumerateDevices: () => {
    return vdiCitrix.enumerateDevices()
  },
  streamIsValid: (stream) => {
    return !!stream
  },
  attachMediaStream: (tag, stream) => {
    const element = typeof tag === 'string' ? document.getElementById(tag) : tag
    vdiCitrix.mapAudioElement(element)
    element.srcObject = stream
    element.play()
  },
})
```
