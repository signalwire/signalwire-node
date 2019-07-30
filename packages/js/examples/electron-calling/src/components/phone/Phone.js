import React, { Component } from 'react'
import Dialpad from './Dialpad';
import Dialog from './Dialog';

export default class Phone extends Component {
  render() {
    const { call } = this.props
    if (call) {
      return <Dialog call={call} />
    } else {
      return <Dialpad newCall={this.props.newCall} />
    }
  }
}
