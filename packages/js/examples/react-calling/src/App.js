import React, { Component } from 'react';
import { Relay } from '@signalwire/js';
import AuthForm from './components/auth/AuthForm';
import { getLoginParams, setLoginParams } from './helpers'
import Phone from './components/phone/Phone'

import './App.css';

class App extends Component {
  state = { connected: false, call: null }

  constructor(props) {
    super(props)

    this.connect = this.connect.bind(this)
    this.newCall = this.newCall.bind(this)

    const tmp = getLoginParams()
    const { project, token } = tmp
    if (project && token) {
      this.connect(tmp)
    }
  }

  connect(params) {
    setLoginParams(params)

    this.session = new Relay(params)
    this.session.on('signalwire.ready', session => {
      this.setState({ connected: true })
    })
    this.session.on('signalwire.error', error => {
      alert(error.message)
    })

    this.session.on('signalwire.socket.error', error => {
      this.setState({ connected: false })
      this.session.disconnect()
    })

    this.session.on('signalwire.socket.close', error => {
      console.log('close', error)
      this.setState({ connected: false })
      this.session.disconnect()
    })

    this.session.on('signalwire.notification', notification => {
      // console.log('GLOBAL notification', notification)

      switch (notification.type) {
        case 'callUpdate':
          const { call } = notification
          if (call.state === 'destroy') {
            this.setState({ call: null })
          } else {
            this.setState({ call })
          }
          break
        case 'participantData':
          // Caller's data like name and number to update the UI. In case of a conference call you will get the name of the room and the extension.
          break
        case 'userMediaError':
          // Permission denied or invalid audio/video params on `getUserMedia`
          break
        default:
      }
    })

    this.session.connect()
  }

  newCall(extension) {
    this.session.newCall({
      destinationNumber: extension,
      audio: true,
      video: true
    })
  }

  render() {
    const { connected, call } = this.state
    const Main = () => {
      if (connected) {
        return <Phone session={this.session} dialog={call} newCall={this.newCall} />
      } else {
        return <AuthForm connect={this.connect} />
      }
    }
    return (
      <div className="App flex">
        <header>SignalWire Call Demo</header>
        <main className="flex flex-center">
          <Main />
        </main>
        <footer>SignalWire - 2019</footer>
      </div>
    )
  }
}

export default App;
