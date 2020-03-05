/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, TextInput, KeyboardAvoidingView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Relay } from '@signalwire/react-native';
import { RTCView } from 'react-native-webrtc';
import Colors from './Colors';


type Props = {};
export default class App extends Component<Props> {

  constructor(props) {
    super(props)
    this.makeCall = this.makeCall.bind(this)
    this.hangup = this.hangup.bind(this)
    this.toggleMic = this.toggleMic.bind(this)
    this.toggleCam = this.toggleCam.bind(this)
    this.toggleDeaf = this.toggleDeaf.bind(this)
    this.switchCamera = this.switchCamera.bind(this)
    this.toggleSpeaker = this.toggleSpeaker.bind(this)

    this.state = {
      connected: false,
      call: null,
      extension: '3593',
      btnMicActive: true,
      btnDeafActive: true,
      btnCamActive: true,
      btnSpeakerActive: true,
    }

    // Use your Project ID and a JWT to create a Relay client.
    this.client = new Relay({
      project: '',
      token: ''
    })

    this.client.on('signalwire.ready', () => {
      this.setState({ connected: true })
    })

    this.client.on('signalwire.error', (error) => {
      console.error(error)
    })

    this.client.on('signalwire.notification', (notification) => {
      switch (notification.type) {
        case 'callUpdate':
          return this._handleCallUpdate(notification.call)
      }
    })

    this.client.iceServers = [
      { urls: ['stun:stun.l.google.com:19302'] }
    ];

    this.client.on('signalwire.socket.open', () => {
      console.log('Socket Open')
    })
    this.client.on('signalwire.socket.close', (event) => {
      console.log('Socket Close', event)
    })
    this.client.on('signalwire.socket.error', () => {
      console.log('Socket Error')
    })

    this.client.connect()
  }

  makeCall() {
    this.client.newCall({ destinationNumber: this.state.extension, video: { facingMode: 'user' } })
  }

  hangup() {
    this.state.call.hangup()
  }

  toggleMic() {
    this.setState({ btnMicActive: !this.state.btnMicActive })
    this.state.call.toggleAudioMute()
  }

  toggleCam() {
    this.setState({ btnCamActive: !this.state.btnCamActive })
    this.state.call.toggleVideoMute()
  }

  toggleDeaf() {
    this.setState({ btnDeafActive: !this.state.btnDeafActive })
    this.state.call.toggleDeaf()
  }

  switchCamera() {
    this.state.call.switchCamera()
  }

  toggleSpeaker() {
    this.setState({ btnSpeakerActive: !this.state.btnSpeakerActive }, () => {
      this.state.call.setSpeakerPhone(this.state.btnSpeakerActive)
    })
  }

  _handleCallUpdate(call) {
    switch (call.state) {
      case 'ringing': {
        const { remoteCallerName, remoteCallerNumber } = call.options
        const caller = remoteCallerName || remoteCallerNumber
        Alert.alert('Inbound Call', `Call from ${caller}`,
          [
            {
              text: 'Reject',
              onPress: () => call.hangup(),
              style: 'cancel'
            },
            {
              text: 'Answer',
              onPress: () => call.answer()
            }
          ],
          { cancelable: false }
        );
        break
      }
      case 'active':
        this.setState({ call })
        break
      case 'destroy':
        this.setState({ call: null })
        break
    }
  }

  _status() {
    return this.state.connected ? 'Connected' : 'Disconnected'
  }

  _middle() {
    if (this.state.call) {
      let streamURL = null
      const { options: { remoteStream = null, localStream = null } } = this.state.call
      console.log('localStream', localStream, localStream.toURL())
      if (remoteStream) {
        console.log('remoteStream', remoteStream, remoteStream.toURL())
        streamURL = remoteStream.toURL()
      }
      return (
        <View style={styles.wrapperMiddle}>
          {streamURL && <RTCView mirror={false} objectFit='contain' streamURL={streamURL} style={{ width: '100%', height: '100%' }} zOrder={1} />}
        </View>
      )
    } else {
      return (
        <View style={styles.wrapperMiddle}>
          <Text style={styles.instructions}>Enter a number:</Text>
          <TextInput
            style={styles.textInput}
            textAlign={'center'}
            onChangeText={(extension) => this.setState({ extension })}
            value={this.state.extension}
          />
        </View>
      )
    }
  }

  _bottom() {
    if (this.state.call) {
      return (
        <View style={styles.wrapperBottom}>
          <View style={styles.wrapperBottomRow}>
            <TouchableOpacity style={styles.button} onPress={this.toggleMic}>
              <Icon name='microphone' size={25} color={ this.state.btnMicActive ? '#000' : 'gray' } />
              <Text style={styles.buttonText}>Mute</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={this.toggleDeaf}>
              <Icon name='volume-mute' size={25} color={ this.state.btnDeafActive ? '#000' : 'gray' } />
              <Text style={styles.buttonText}>Deaf</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={this.toggleCam}>
              <Icon name='camera' size={25} color={ this.state.btnCamActive ? '#000' : 'gray'} />
              <Text style={styles.buttonText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={this.switchCamera}>
              <Icon name='camera-retake' size={25} color='#000' />
              <Text style={styles.buttonText}>Flip Cam</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={this.toggleSpeaker}>
              <Icon name='volume-high' size={25} color={ this.state.btnSpeakerActive ? '#000' : 'gray'} />
              <Text style={styles.buttonText}>Speaker</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.wrapperBottomRow}>
            <TouchableOpacity style={[styles.button, { backgroundColor: Colors.red }]} onPress={this.hangup}>
              <Icon name='phone-hangup' size={25} color='#FFF' />
            </TouchableOpacity>
          </View>
        </View>
      )
    } else {
      return (
        <View style={styles.wrapperBottom}>
          <View style={styles.wrapperBottomRow}>
            <TouchableOpacity style={[styles.button, { backgroundColor: Colors.green }]} onPress={this.makeCall}>
              <Icon name='phone' size={25} color='#FFFFFF' />
            </TouchableOpacity>
          </View>
        </View>
      )
    }
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.container}>
        <View style={styles.wrapperTop}>
          <Text style={styles.welcome}>Welcome to SignalWire!</Text>
          <Text style={styles.instructions}>Status: {this._status()}</Text>
        </View>
        {this._middle()}
        {this._bottom()}
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  wrapperTop: {
    flex: 0.5,
    justifyContent: 'center'
  },
  wrapperMiddle: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#000',
    borderTopWidth: 1
  },
  wrapperBottom: {
    flex: 0.5,
    borderColor: '#000',
    borderTopWidth: 1,
    borderBottomWidth: 1
  },
  wrapperBottomRow: {
    flex: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  textInput: {
    height: 40, width: '80%', borderColor: 'gray', borderWidth: 1,
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
    width: '20%'
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 12
  },
});
