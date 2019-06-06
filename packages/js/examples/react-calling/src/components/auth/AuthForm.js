import React, { Component } from 'react'
import './AuthForm.css'
import { getLoginParams } from '../../helpers'

export default class AuthForm extends Component {
  constructor(props) {
    super(props)

    this._doConnect = this._doConnect.bind(this)
    this._handleChange = this._handleChange.bind(this)
    this.state = getLoginParams()
  }

  _doConnect() {
    this.props.connect(this.state)
  }

  _handleChange(event) {
    this.setState({ [event.target.dataset.target]: event.target.value })
  }

  render() {
    return (
      <div className="connect flex flex-column">
        <p className="text-center">You are not connected yet!</p>
        <label>Project:</label>
        <input type="text" data-target="project" value={this.state.project} onChange={this._handleChange} />
        <label>Token:</label>
        <input type="text" data-target="token" value={this.state.token} onChange={this._handleChange} />
        <button onClick={this._doConnect}>Connect</button>
      </div>
    )
  }
}
