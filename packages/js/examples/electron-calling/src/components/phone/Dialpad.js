import React, { Component } from 'react'

export default class Dialpad extends Component {

  constructor(props) {
    super(props)
    this.state = { extension: '' }
    this._newAudioCall = this._newAudioCall.bind(this)
    this._newVideoCall = this._newVideoCall.bind(this)
    this._handleChange = this._handleChange.bind(this)
  }

  _newAudioCall() {
    this.props.newCall(this.state.extension, false)
  }

  _newVideoCall() {
    this.props.newCall(this.state.extension, true)
  }

  _handleChange(event) {
    this.setState({ extension: event.target.value })
  }

  render() {
    return (
      <div className="dialpad flex flex-column flex-center items-stretch">
        <label>Call To:</label>
        <input type="text" value={this.state.extension} onChange={this._handleChange} placeholder="Enter Resource or Number to Dial" />
        <div className="dialog-actions text-center">
          <button onClick={this._newAudioCall}>Audio Call</button>
          <button onClick={this._newVideoCall}>Video Call</button>
        </div>
      </div>
    )
  }
}
