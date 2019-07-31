import React from 'react'
import { Relay } from '@signalwire/js'
import Phone from './components/phone/Phone'

export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = { connectStatus: 'Disconnected', call: null }
    this.connect = this.connect.bind(this)
    this.newCall = this.newCall.bind(this)
  }

  connect() {
    this.setState({ connectStatus: 'Connecting..' })

    this.session = new Relay({
      project: '4b7ae78a-d02e-4889-a63b-08b156d5916e', // Fill in your Project ID here
      token: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NjQ1ODA0NjMsImlzcyI6IlNpZ25hbFdpcmUgSldUIiwianRpIjoiMFloQU5tZ3BnTnMtYkR2LVZBdUE2LXdVUmZJIiwic2NvcGUiOiJ3ZWJydGMiLCJzdWIiOiI0YjdhZTc4YS1kMDJlLTQ4ODktYTYzYi0wOGIxNTZkNTkxNmUiLCJyZXNvdXJjZSI6ImVsZW5hIiwiZXhwIjoxNTY0NTg3NjYzfQ.pJTJx6dfTlDNg3PZnmKEOBD8rR-oMTtnF5TDwRIRLcFBCEkZCJfO3GU0ZUo9Gi9vS8pSiYPD6zzo7GZt5CI9aQ' // Fill in your JWT here
    })
    this.session.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
    this.session.on('signalwire.ready', session => {
      this.setState({ connectStatus: 'Connected' })
    })

    this.session.on('signalwire.error', error => {
      alert(error.message)
    })

    this.session.on('signalwire.socket.error', error => {
      this.setState({ connectStatus: 'Disconnected' })
      this.session.disconnect()
    })

    this.session.on('signalwire.socket.close', error => {
      this.setState({ connectStatus: 'Disconnected' })
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
      }
    })

    this.session.connect()
  }

  newCall(destinationNumber, video) {
    if (this.session.connected && destinationNumber) {
      video = video || false
      this.session.newCall({ destinationNumber, video })
    }
  }

  componentDidMount() {
    this.connect()
  }

  componentWillUnmount() {
    if (this.session) {
      console.log('componentWillUnmount.. disconnect!')
      this.session.disconnect()
    }
  }

  render() {
    const { connectStatus, call } = this.state
    return (
      <React.Fragment>
        <header className="text-center">
          <h1>Relay Electron Demo</h1>
          <h3>Status: {connectStatus}</h3>
        </header>
        <main>
          <Phone session={this.session} call={call} newCall={this.newCall} />
        </main>
        <footer className="text-center">
          <h4>SignalWire - 2019</h4>
        </footer>
      </React.Fragment>
    )
  }
}
