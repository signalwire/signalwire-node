import React, {useState} from 'react';
import {RTCView} from 'react-native-webrtc';
import Colors from './Colors';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import useRelayClient from './lib/useRelayClient';
import {Relay} from '@signalwire/react-native';

export default function App(): JSX.Element {
  const {client, connected, call} = useRelayClient(
    {
      project: '90389dd8-514c-4a1b-8445-772bbdcc889d',
      token:
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE2OTU3NDY2MjYsImlzcyI6IlNpZ25hbFdpcmUgSldUIiwianRpIjoiMTFNbkdqV3JsRTR5aWFNNWdHUzVVTnBaR2hBIiwic2NvcGUiOiJ3ZWJydGMiLCJzdWIiOiI5MDM4OWRkOC01MTRjLTRhMWItODQ0NS03NzJiYmRjYzg4OWQiLCJyZXNvdXJjZSI6IjkzODFmMGZmLTgyOGMtNDJlNC1hZjEwLTcwNjIyODg3ZTM2MyIsImV4cCI6MTY5NTc0NzUyNn0.uEvQLRaXFrvm_hhQn2buCzf-GATj-n1q04lh7_OHNWFDXNfeFn-HSdUxDvEaoXsVrAothrhdRydk0Ff5Lvi1ow',
    },
    function onRinging(call) {
      const {remoteCallerName, remoteCallerNumber} = call.options;
      const caller = remoteCallerName || remoteCallerNumber;
      Alert.alert(
        'Inbound Call',
        `Call from ${caller}`,
        [
          {
            text: 'Reject',
            onPress: () => call.hangup(),
            style: 'cancel',
          },
          {
            text: 'Answer',
            onPress: () => call.answer(),
          },
        ],
        {cancelable: false},
      );
    },
  );

  const [extension, setExtension] = useState('3593');

  return (
    <KeyboardAvoidingView style={styles.container}>
      <View style={styles.wrapperTop}>
        <Text style={styles.welcome}>Welcome to SignalWire!</Text>
        <Text style={styles.instructions}>
          Status: {connected ? 'Connected' : 'Not connected'}
        </Text>
      </View>
      <Middle call={call} extension={extension} setExtension={setExtension} />
      {client && <Bottom call={call} client={client} extension={extension} />}
    </KeyboardAvoidingView>
  );
}

function Middle({
  call,
  extension,
  setExtension,
}: {
  call: any;
  extension: string;
  setExtension: (_: string) => void;
}) {
  if (call) {
    let streamURL = null;
    const {
      options: {remoteStream = null, localStream = null},
    } = call;
    console.log('localStream', localStream, localStream.toURL());
    if (remoteStream) {
      console.log('remoteStream', remoteStream, remoteStream.toURL());
      streamURL = remoteStream.toURL();
    }
    return (
      <View style={styles.wrapperMiddle}>
        {streamURL && (
          <RTCView
            mirror={false}
            objectFit="contain"
            streamURL={streamURL}
            style={{width: '100%', height: '100%'}}
            zOrder={1}
          />
        )}
      </View>
    );
  } else {
    return (
      <View style={styles.wrapperMiddle}>
        <Text style={styles.instructions}>Enter a number:</Text>
        <TextInput
          style={styles.textInput}
          textAlign={'center'}
          onChangeText={extension => setExtension(extension)}
          value={extension}
        />
      </View>
    );
  }
}

function Bottom({
  client,
  call,
  extension,
}: {
  client: Relay;
  call: any;
  extension: string;
}) {
  const [btnMicActive, setBtnMicActive] = useState(false);
  const [btnCamActive, setBtnCamActive] = useState(false);
  const [btnDeafActive, setBtnDeafActive] = useState(false);

  const [btnSpeakerActive, setBtnSpeakerActive] = useState(false);

  function makeCall() {
    // @ts-ignore
    client.newCall({destinationNumber: extension, video: {facingMode: 'user'}});
  }

  function hangup() {
    call.hangup();
  }

  function toggleMic() {
    setBtnMicActive(i => !i);
    call.toggleAudioMute();
  }

  function toggleCam() {
    setBtnCamActive(u => !u);
    call.toggleVideoMute();
  }

  function toggleDeaf() {
    setBtnDeafActive(i => !i);
    call.toggleDeaf();
  }

  function switchCamera() {
    call.switchCamera();
  }

  function toggleSpeaker() {
    setBtnSpeakerActive(i => !i);
    setTimeout(() => {
      // only call on next render
      call.setSpeakerPhone(btnSpeakerActive);
    }, 0);
  }

  if (call) {
    return (
      <View style={styles.wrapperBottom}>
        <View style={styles.wrapperBottomRow}>
          <TouchableOpacity style={styles.button} onPress={toggleMic}>
            <Icon
              name="microphone"
              size={25}
              color={btnMicActive ? '#000' : 'gray'}
            />
            <Text style={styles.buttonText}>Mute</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={toggleDeaf}>
            <Icon
              name="volume-mute"
              size={25}
              color={btnDeafActive ? '#000' : 'gray'}
            />
            <Text style={styles.buttonText}>Deaf</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={toggleCam}>
            <Icon
              name="camera"
              size={25}
              color={btnCamActive ? '#000' : 'gray'}
            />
            <Text style={styles.buttonText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={switchCamera}>
            <Icon name="camera-retake" size={25} color="#000" />
            <Text style={styles.buttonText}>Flip Cam</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={toggleSpeaker}>
            <Icon
              name="volume-high"
              size={25}
              color={btnSpeakerActive ? '#000' : 'gray'}
            />
            <Text style={styles.buttonText}>Speaker</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.wrapperBottomRow}>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: Colors.red}]}
            onPress={hangup}>
            <Icon name="phone-hangup" size={25} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  } else {
    return (
      <View style={styles.wrapperBottom}>
        <View style={styles.wrapperBottomRow}>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: Colors.green}]}
            onPress={makeCall}>
            <Icon name="phone" size={25} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: 700,
  },
  wrapperTop: {
    flex: 0.5,
    justifyContent: 'center',
  },
  wrapperMiddle: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#000',
    borderTopWidth: 1,
  },
  wrapperBottom: {
    flex: 0.5,
    borderColor: '#000',
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  wrapperBottomRow: {
    flex: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  textInput: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    height: 40,
    width: '20%',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 12,
  },
});
