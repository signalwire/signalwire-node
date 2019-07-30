import React, { Component } from 'react'

const STATES = {
  new: 'Dialog initialization...',
  active: 'Call is active!',
  ringing: 'Ringing..',
  held: 'On Hold..',
  hangup: 'Hangup..',
  destroy: 'Hangup..',
}

class DialogVideo extends Component {
  constructor(props) {
    super(props)
    this.videoRef = React.createRef()
  }

  componentDidMount() {
    this.videoRef.current.srcObject = this.props.stream
  }

  componentDidUpdate() {
    if (this.videoRef.current.srcObject !== this.props.stream) {
      this.videoRef.current.srcObject = this.props.stream
    }
  }

  render() {
    const videoClass = this.props.videoEnabled ? '' : 'notVisible'
    return <video ref={this.videoRef} id="dialogVideo" autoPlay="autoplay" controls={false} className={videoClass}></video>
  }
}

export default class Dialog extends Component {
  constructor(props) {
    super(props)
    this.state = { btnMicActive: true, btnDeafActive: true, btnHoldActive: true }
    this._answer = this._answer.bind(this)
    this._hangup = this._hangup.bind(this)
    this._toggleMic = this._toggleMic.bind(this)
    this._toggleDeaf = this._toggleDeaf.bind(this)
    this._toggleHold = this._toggleHold.bind(this)
  }

  _answer() {
    this.props.call.answer()
  }

  _hangup() {
    this.props.call.hangup()
  }

  _toggleMic() {
    this.setState({ btnMicActive: !this.state.btnMicActive })
    this.props.call.toggleAudioMute()
  }

  _toggleDeaf() {
    this.setState({ btnDeafActive: !this.state.btnDeafActive })
    this.props.call.toggleDeaf()
  }

  _toggleHold() {
    this.setState({ btnHoldActive: !this.state.btnHoldActive })
    this.props.call.toggleHold()
  }

  _callIsActive() {
    return ['active', 'held'].includes(this.props.call.state)
  }

  render() {
    const { call } = this.props
    const { btnMicActive, btnDeafActive, btnHoldActive } = this.state
    return (
      <div className="dialog flex flex-column flex-center items-stretch">
        <span className="text-center">{STATES[call.state] || 'Connecting...'}</span>
        {call.state === 'ringing' && <button onClick={this._answer}>Answer</button>}
        {this._callIsActive() && call.remoteStream && <DialogVideo stream={call.remoteStream} videoEnabled={call.options.video} />}
        <div className="dialog-actions text-center">
          {this._callIsActive() && <button onClick={this._toggleMic}>{btnMicActive ? 'Mute' : 'Unmute'}</button>}
          {this._callIsActive() && <button onClick={this._toggleDeaf}>{btnDeafActive ? 'Deaf' : 'Undeaf'}</button>}
          {this._callIsActive() && <button onClick={this._toggleHold}>{btnHoldActive ? 'Hold' : 'Unhold'}</button>}
        </div>
        <div className="dialog-actions text-center">
          {this._callIsActive() && <button onClick={this._hangup}>Hangup</button>}
        </div>
      </div>
    )
  }
}
