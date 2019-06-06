var client;
var currentCall = null;

var project = localStorage.getItem('relay.example.project') || '';
var token = localStorage.getItem('relay.example.token') || '';
var number = localStorage.getItem('relay.example.number') || '';
var audio = localStorage.getItem('relay.example.audio') || '1';
var video = localStorage.getItem('relay.example.video') || '1';

/**
 * On document ready auto-fill the input values from the localStorage.
*/
ready(function() {
  document.getElementById('project').value = project;
  document.getElementById('token').value = token;
  document.getElementById('number').value = number;
  document.getElementById('audio').checked = audio === '1';
  document.getElementById('video').checked = video === '1';
});

/**
 * Connect with Relay creating a client and attaching all the event handler.
*/
function connect() {
  client = new Relay({
    project: document.getElementById('project').value,
    token: document.getElementById('token').value
  });

  client.remoteElement = 'remoteVideo';
  client.localElement = 'localVideo';

  client.on('signalwire.ready', function() {
    btnConnect.classList.add('d-none');
    btnDisconnect.classList.remove('d-none');
    connectStatus.innerHTML = 'Connected';

    startCall.disabled = false;
  });

  // Update UI on socket close
  client.on('signalwire.socket.close', function() {
    btnConnect.classList.remove('d-none');
    btnDisconnect.classList.add('d-none');
    connectStatus.innerHTML = 'Disconnected';
  });

  // Handle error...
  client.on('signalwire.error', function(error){
    console.error("SignalWire error:", error);
  });

  client.on('signalwire.notification', handleNotification);

  connectStatus.innerHTML = 'Connecting...';
  client.connect();
}

function disconnect() {
  connectStatus.innerHTML = 'Disconnecting...';
  client.disconnect();
}

/**
 * Handle notification from the client.
*/
function handleNotification(notification) {
  // console.log("notification", notification.type, notification);
  switch (notification.type) {
    case 'callUpdate':
      handleCallUpdate(notification.call);
      break;
    case 'participantData':
      // Caller's data like name and number to update the UI. In case of a conference call you will get the name of the room and the extension.
      break;
    case 'userMediaError':
      // Permission denied or invalid audio/video params on `getUserMedia`
      break;
  }
}

/**
 * Update the UI when the call's state change
*/
function handleCallUpdate(call) {
  currentCall = call;

  switch (call.state) {
    case 'new': // Setup the UI
      break;
    case 'trying': // You are trying to call someone and he's ringing now
      break;
    case 'ringing': // Someone is calling you
      if (confirm('Pick up the call?')) {
        currentCall.answer();
      } else {
        currentCall.hangup();
      }
      break;
    case 'active': // Call has become active
      startCall.classList.add('d-none');
      hangupCall.classList.remove('d-none');
      hangupCall.disabled = false;
      break;
    case 'hangup': // Call is over
      startCall.classList.remove('d-none');
      hangupCall.classList.add('d-none');
      hangupCall.disabled = true;
      break;
    case 'destroy': // Call has been destroyed
      currentCall = null;
      break;
  }
}

/**
 * Make a new outbound call
*/
function makeCall() {
  const params = {
    destinationNumber: document.getElementById('number').value, // required!
    audio: document.getElementById('audio').checked,
    video: document.getElementById('video').checked ? { aspectRatio: 16/9 } : false,
  };

  currentCall = client.newCall(params);
}

/**
 * Hangup the currentCall if present
*/
function hangup() {
  if (currentCall) {
    currentCall.hangup()
  }
}

function saveInLocalStorage(e) {
  var key = e.target.name || e.target.id
  localStorage.setItem('relay.example.' + key, e.target.value);
}

// jQuery document.ready equivalent
function ready(callback) {
  if (document.readyState != 'loading') {
    callback();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState != 'loading') {
        callback();
      }
    });
  }
}
