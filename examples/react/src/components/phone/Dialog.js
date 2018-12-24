import React, { Component } from 'react'
import './Dialog.css'

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
    return <video ref={this.videoRef} id="dialogVideo" autoPlay="autoplay" controls={false}></video>
  }
}

class DialogActions extends Component {
  render() {
    const { dialog } = this.props
    return (
      <div className="dialog-actions">
        {dialog.state === 'active' && <button onClick={dialog.hangup.bind(dialog)}>Hangup</button>}
        {dialog.state === 'active' && <button onClick={dialog.toggleHold.bind(dialog)}>Hold</button>}
        {dialog.state === 'held' && <button onClick={dialog.toggleHold.bind(dialog)}>UnHold</button>}
      </div>
    )
  }
}

const RECORDING_PATH = '/opt/recordings/'
class DialogModActions extends Component {
  render() {
    const { dialog } = this.props
    if (dialog.role !== 'moderator') {
      return null
    }
    return (
      <div className="dialog-mod-actions">
        <button onClick={dialog.record.bind(dialog, `${RECORDING_PATH}${dialog.id}.mp4`)}>Record</button>
        <button onClick={dialog.stopRecord.bind(dialog)}>Stop Record</button>
        <button onClick={dialog.listVideoLayouts.bind(dialog)}>List Layouts</button>
      </div>
    )
  }
}

const STATES = {
  new: 'Dialog initialization...',
  trying: 'Connecting...',
  active: 'Connection successful!',
  ringing: 'Ringing..',
}

export default class Dialog extends Component {
  constructor(props) {
    super(props)
    this._answer = this._answer.bind(this)
  }

  _answer() {
    this.props.dialog.answer()
  }

  render() {
    const { dialog } = this.props
    return (
      <div className="dialog flex flex-column">
        <span>
          Dialog id: {dialog.id}
          <br/>
          {STATES[dialog.state]}
        </span>

        {dialog.state === 'ringing' && <button onClick={this._answer}>Answer</button>}
        {dialog.remoteStream && <DialogVideo stream={dialog.remoteStream} />}
        <DialogActions dialog={dialog} />
      </div>
      // TODO: Add DialogModActions when modCommands will be merged in master
      // <DialogModActions dialog={dialog} />
    )
  }
}
