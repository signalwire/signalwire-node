/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet, Text, View, TextInput } from 'react-native';
import { Relay, Verto } from '@signalwire/react-native';
import { RTCView } from 'react-native-webrtc';


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
      extension: '3593'
    }

    this.speakerPhone = false

    this.client = new Verto({
      host: 'cantina.signalwire.com/wss2',
      login: '1008',
      passwd: '1234'
    })
    // this.client = new Relay({
    //   project: '',
    //   token: ''
    // })
    this.client.__logger.setLevel(1)

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

    this.client.iceServers = [{
      url: 'turn:turn.cantina.signalwire.com:443?transport=tcp',
      username: 'verto',
      credential: 'signalwire'
    }];

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
    this.state.call.toggleAudioMute()
  }

  toggleCam() {
    this.state.call.toggleVideoMute()
  }

  toggleDeaf() {
    this.state.call.toggleDeaf()
  }

  switchCamera() {
    this.state.call.switchCamera()
  }

  toggleSpeaker() {
    this.speakerPhone = !this.speakerPhone
    this.state.call.setSpeakerPhone(this.speakerPhone)
  }

  _handleCallUpdate(call) {
    switch (call.state) {
      case 'ringing':
        call.answer()
        break
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
          <Text style={styles.instructions}>{this.state.call.state}</Text>
          {streamURL && <RTCView mirror={false} objectFit='cover' streamURL={streamURL} style={{ width: 200, height: 200 }} zOrder={1} />}
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
              <Text style={styles.buttonText}>Toggle Mic</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={this.hangup}>
              <Text style={styles.buttonText}>HangUp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={this.toggleDeaf}>
              <Text style={styles.buttonText}>Toggle Deaf</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.wrapperBottomRow}>
            <TouchableOpacity style={styles.button} onPress={this.toggleCam}>
              <Text style={styles.buttonText}>Toggle Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={this.switchCamera}>
              <Text style={styles.buttonText}>Switch Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={this.toggleSpeaker}>
              <Text style={styles.buttonText}>Toggle Speaker</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    } else {
      return (
        <View style={[styles.wrapperBottom, { flex: 0.5 }]}>
          <View style={styles.wrapperBottomRow}>
            <TouchableOpacity style={styles.button} onPress={this.makeCall}>
              <Text style={styles.buttonText}>Make Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.wrapperTop}>
          <Text style={styles.welcome}>Welcome to SignalWire!</Text>
          <Text style={styles.instructions}>Status: {this._status()}</Text>
        </View>
        {this._middle()}
        {this._bottom()}
      </View>
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
    flex: 1,
    borderColor: '#000',
    borderTopWidth: 1,
    borderBottomWidth: 1
  },
  wrapperBottomRow: {
    flex: 1,
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
    width: '23%',
    borderColor: '#000',
    borderWidth: 1
  },
  buttonText: {
    textAlign: 'center'
  },
});
