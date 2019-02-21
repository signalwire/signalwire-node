var client;
var cur_call = null;

var username = localStorage.getItem('verto.example.username');
var password = localStorage.getItem('verto.example.password');
var domain   = localStorage.getItem('verto.example.domain');
var host     = localStorage.getItem('verto.example.host');
var number   = localStorage.getItem('verto.example.number');

ready(function() {
  if (!domain)   domain   = window.location.hostname;
  if (!host)     host     = window.location.host;
  if (!username) username = '1000';
  if (!password) password = '1234';
  if (!number)   number   = '9196';

  document.getElementById('username').value = username;
  document.getElementById('password').value = password;
  document.getElementById('domain').value = domain;
  document.getElementById('host').value = host;
  document.getElementById('number').value = number;
});

function connect() {

  host     = document.getElementById('host').value;
  domain   = document.getElementById('domain').value;
  username = document.getElementById('username').value;
  password = document.getElementById('password').value;
  login    = username + '@' + domain;

  client = new Verto({
    host: host,
    login: login,
    passwd: password
  });

  client.on('signalwire.ready', function() {
    document.getElementById('connectStatus').innerHTML = "connected";
  });

  client.on('signalwire.socket.open', function() {
    // Do something when the socket has been opened!
    console.log("socket connected");
  });

  client.on('signalwire.error', function(error){
    // Handle error
    console.warn("SignalWire error", error);
  });

  client.on('signalwire.notification', function(notification){
    console.log("notification", notification.type, notification);
    switch (notification.type) {
      case 'dialogUpdate':
        handleDialogChange(notification.dialog)
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
  });

  document.getElementById('connectStatus').innerHTML = "connecting..";
  client.connect();
}

function handleDialogChange(dialog) {
  // Update the UI when this dialog's state change:

  console.log("dialog.state", dialog.state);

  cur_call = dialog;

  switch (dialog.state) {
    case 'New':
      // Setup the UI
      break;
    case 'Trying':
      // You are calling someone and he's ringing now
      break;
    case 'Ringing':
      // Someone is calling you
      break;
    case 'Active':
      // Dialog has become active
      document.getElementById('remoteVideo').style.display = "block";
      document.getElementById('localVideo').style.display = "block";

      break;
    case 'Hangup':
      // Dialog is over
      document.getElementById('remoteVideo').style.display = "none";
      document.getElementById('localVideo').style.display = "none";

      break;
    case 'Destroy':
      // Dialog has been destroyed
      break;
  }
}

function makeCall() {
  const params = {
    // Required:
    destinationNumber: document.getElementById('number').value,
    remoteCallerName: 'Joe Example',
    remoteCallerNumber: 'joe@example.com',
    callerName: 'J. Smith',
    callerNumber: 'smith@example.com',

    // Optional:
    // localStream: MediaStream, // Use this stream instead of retrieving a new one. Useful if you have a stream from a canvas.captureStream() or from a screen share extension.
    audio: true, // Boolean or https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#Properties_of_audio_tracks
    video: true, // Boolean or https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#Properties_of_video_tracks
    // iceServers: true || false || RTCIceServer[], // https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer
    // useStereo: true || false,
    // micId: '<deviceUUID>', // Microphone device ID
    // camId: '<deviceUUID>', // Webcam device ID
    userVariables: {
      // General user variables.. email/username
    },
    localElement: 'localVideo', // Video element ID to display the localStream
    remoteElement: 'remoteVideo', // Video element ID to display the remoteStream
    onNotification: function (notification) {
      handleDialogChange(notification.dialog)
    }
  }

  cur_call = client.newCall(params);
}

function hangup() {
  cur_call.hangup();
}

function save_params(e) {
  console.log(e.target.id, e.target.value);
  localStorage.setItem('verto.example.' + e.target.id, e.target.value);
}

// jQuery document.ready equivalent
function ready(fn) {
  if (document.readyState != 'loading') {
    fn();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState != 'loading')
        fn();
    });
  }
}
