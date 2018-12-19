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

  client.on('signalwire.socket.open', function() {
    // Do something when the socket has been opened!
    console.log("connected");
    document.getElementById('connectStatus').innerHTML = "connected";
  });

  client.on('signalwire.socket.message', function(message){
    // Do something with the received message!
    console.log("message", message);
  });

  client.on('signalwire.verto.dialogChange', function(dialog){
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

        var video = document.getElementById('remoteVideo');
        video.srcObject = dialog.remoteStream;
        video.style.display = "block";

        video = document.getElementById('localVideo')
        video.srcObject = dialog.localStream;
        video.style.display = "block";

        break;
      case 'Hangup':
        // Dialog is over
        var video = document.getElementById('remoteVideo');
        video.style.display = "none";
        video = document.getElementById('localVideo');
        video.style.display = "none";

        break;
      case 'Destroy':
        // Dialog has been destroyed
        break;
    }
  });


  client.connect();
}

function makeCall() {
  const params = {
    // Required:
    destination_number: document.getElementById('number').value,
    remote_caller_id_name: 'Joe Example',
    remote_caller_id_number: 'joe@example.com',
    caller_id_name: 'J. Smith',
    caller_id_number: 'smith@example.com',

    // Optional:
    // localStream: MediaStream, // Use this stream instead of retrieving a new one. Useful if you have a stream from a canvas.captureStream() or from a screen share extension.
    audio: true || false || MediaTrackConstraints, // https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#Properties_of_audio_tracks
    video: true || false || MediaTrackConstraints, // https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#Properties_of_video_tracks
    // iceServers: true || false || RTCIceServer[], // https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer
    // useStereo: true || false,
    // micId: '<deviceUUID>', // Microphone device ID
    // camId: '<deviceUUID>', // Webcam device ID
    userVariables: {
      // General user variables.. email/username
    },
    // onChange: function(dialog) {
      // Override global "signalwire.verto.dialogChange" callback for this dialog..
    // },
    onNotification: function(message) {
      // This callback will automatically subscribe the client to a liveArray for this dialog so here you'll get the liveArray messages like bootObj - add - modify - del for the current conference call.
    },
    onUserMediaError: function(error) {
      // Permission denied or invalid audio/video params
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
