var client;
var cur_call = null;

var project = localStorage.getItem('verto.example.project') || '';
var token = localStorage.getItem('verto.example.token') || '';
var number = localStorage.getItem('verto.example.number') || '';
var audio = localStorage.getItem('verto.example.audio') || '1';
var video = localStorage.getItem('verto.example.video') || '1';

ready(function() {
  document.getElementById('project').value = project;
  document.getElementById('token').value = token;
  document.getElementById('number').value = number;
  document.getElementById('audio').checked = audio === '1';
  document.getElementById('video').checked = video === '1';
});

function disconnect() {
  connectStatus.innerHTML = 'disconnecting..'
  client.disconnect()
}

function connect() {
  client = new Relay({
    project: document.getElementById('project').value,
    token: document.getElementById('token').value
  });

  client.remoteElement = 'remoteVideo'

  client.on('signalwire.ready', function() {
    btnConnect.disabled = true
    btnDisconnect.disabled = false
    connectStatus.innerHTML = 'connected!'
    callCommands.style.display = 'block'

    startCall.disabled = false
  });

  client.on('signalwire.socket.open', function() {
    console.log('socket connected')
  });

  client.on('signalwire.socket.close', function() {
    console.log('socket disconnected')
    btnConnect.disabled = false
    btnDisconnect.disabled = true
    connectStatus.innerHTML = 'disconnected'
    callCommands.style.display = 'none'
  });

  client.on('signalwire.error', function(error){
    // Handle error
    console.warn("SignalWire error", error);
  });

  client.on('signalwire.notification', handleNotification);

  connectStatus.innerHTML = 'connecting..'
  client.connect()
}

function handleNotification(notification) {
  // console.log("notification", notification.type, notification);
  switch (notification.type) {
    case 'callUpdate':
      handleCallUpdate(notification.call)
      break
    case 'conferenceUpdate':
      handleConferenceUpdate(notification)
      break
    case 'participantData':
      // Caller's data like name and number to update the UI. In case of a conference call you will get the name of the room and the extension.
      break
    case 'userMediaError':
      // Permission denied or invalid audio/video params on `getUserMedia`
      break
    case 'event':
      // Generic notification received
      break
  }
}

function handleCallUpdate(call) {
  // Update the UI when this call's state change:

  // console.log("call.state", call.state);

  cur_call = call;

  switch (call.state) {
    case 'new':
      // Setup the UI
      break;
    case 'trying':
      // You are calling someone and he's ringing now
      break;
    case 'ringing':
      // Someone is calling you
      if (confirm('Pick up the call?')) {
        cur_call.answer()
      } else {
        cur_call.hangup()
      }
      break;
    case 'active':
      // Call has become active
      hangupCall.disabled = false
      remoteVideo.style.display = 'block'
      confCommands.style.display = 'block'
      // localVideo.style.display = 'block'
      startScreenShare.onclick = function() {
        call.startScreenShare()
      }
      break;
    case 'hangup':
      // Call is over
      hangupCall.disabled = true
      startCall.disabled = false

      remoteVideo.style.display = 'none'
      confCommands.style.display = 'none'
      // localVideo.style.display = 'none'

      break;
    case 'destroy':
      // Call has been destroyed
      cur_call = null;
      break;
  }
}

function _createLiParticipant(part) {
  var li = document.createElement('li')
  li.id = 'p-' + part.participantId
  li.appendChild(document.createTextNode(part.participantName + ' ' + part.participantNumber))
  if (cur_call.role === 'moderator') {
    var kickBtn = document.createElement('button')
    kickBtn.innerHTML = 'Kick'
    kickBtn.onclick = function () {
      cur_call.kick(part.participantId)
    }
    li.appendChild(kickBtn)
  }
  return li
}

function handleConferenceUpdate(notification) {
  switch (notification.action) {
    case 'join':
    case 'leave':
    case 'clear':
      participants.innerHTML = ''
      break
    case 'bootstrap':
      participants.innerHTML = ''
      notification.participants.forEach(function(part) {
        participants.appendChild(_createLiParticipant(part))
      })
      break
    case 'add':
      participants.appendChild(_createLiParticipant(notification))
      break
    case 'modify':
      break
    case 'delete':
      var li = document.getElementById('p-' + notification.participantId)
      if (li) {
        li.remove()
      }
      break
  }
}

function makeCall() {
  const params = {
    destinationNumber: document.getElementById('number').value, // required!
    audio: document.getElementById('audio').checked,
    video: document.getElementById('video').checked,
  }

  cur_call = client.newCall(params);
}

function hangup() {
  cur_call.hangup()
}

function save_params(e) {
  var key = e.target.name || e.target.id
  localStorage.setItem('verto.example.' + key, e.target.value);
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
