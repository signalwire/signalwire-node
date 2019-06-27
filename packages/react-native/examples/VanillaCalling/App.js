/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { Relay, Verto } from '@signalwire/react-native';
import { RTCView } from 'react-native-webrtc';


type Props = {};
export default class App extends Component<Props> {

  constructor(props) {
    super(props)
    this.newCall = this.newCall.bind(this)

    this.state = {
      connected: false,
      call: null
    }

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

  newCall() {
    this.client.newCall({ destinationNumber: '3593', video: { facingMode: 'user' } })
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

  render() {
    let streamURL = null
    if (this.state.call) {
      const { options: { remoteStream = null, localStream = null } } = this.state.call
      console.log('localStream', localStream, localStream.toURL())
      if (remoteStream) {
        console.log('remoteStream', remoteStream, remoteStream.toURL())
        streamURL = remoteStream.toURL()
      }
    }
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to SignalWire!</Text>
        {this.state.connected && <Text style={styles.instructions}>Connected!</Text>}
        {this.state.call && <Text style={styles.instructions}>{this.state.call.state}</Text>}
        {streamURL && <RTCView mirror={false} objectFit='cover' streamURL={streamURL} style={{ width: 200, height: 200 }} zOrder={1} />}

        <TouchableOpacity style={styles.button} onPress={this.newCall}>
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
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
    borderRadius: 100
  },
  buttonText: {
    textAlign: 'center'
  },
});
