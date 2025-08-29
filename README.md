# SignalWire SDK for Node.js and JavaScript

[![CI](https://github.com/signalwire/signalwire-node/actions/workflows/ci.yml/badge.svg)](https://github.com/signalwire/signalwire-node/actions/workflows/ci.yml)

This package provides a client for Signalwire services and supports different Javascript environments.

### Packages

| Project | Description | README | CHANGELOG | Version |
| ------- | ------- | ------- | ------- |:-----:|
| **Node.js** | SignalWire in Node.js | [`README.md`](packages/node/README.md) | [`CHANGELOG.md`](packages/node/CHANGELOG.md) | ![NPM](https://img.shields.io/npm/v/@signalwire/node.svg?color=brightgreen)
| **JavaScript** | SignalWire in the browser! | [`README.md`](packages/js/README.md) | [`CHANGELOG.md`](packages/js/CHANGELOG.md) | ![NPM](https://img.shields.io/npm/v/@signalwire/js/legacy.svg?color=brightgreen)
| **React Native** | SignalWire in a React Native App | [`README.md`](packages/react-native/README.md) | [`CHANGELOG.md`](packages/react-native/CHANGELOG.md) | ![NPM](https://img.shields.io/npm/v/@signalwire/react-native.svg?color=brightgreen)

Refer to the README of each package for further details.

## Hangup Error Handling

The SDK now properly reports error causes when calls are terminated due to exceptions. When an error occurs during call setup or negotiation, the `verto.bye` message will include specific error information instead of the generic `NORMAL_CLEARING` cause.

### Error Payload Examples

#### Normal Call Clearing
```json
{
  "method": "verto.bye",
  "params": {
    "sessid": "session-id",
    "dialogParams": { /* ... */ },
    "cause": "NORMAL_CLEARING",
    "causeCode": 16
  }
}
```

#### Error Setting Remote SDP
```json
{
  "method": "verto.bye",
  "params": {
    "sessid": "session-id",
    "dialogParams": { /* ... */ },
    "cause": "ERROR_SETTING_REMOTE_SDP",
    "causeCode": 666
  }
}
```

#### Error Sending Answer
```json
{
  "method": "verto.bye",
  "params": {
    "sessid": "session-id",
    "dialogParams": { /* ... */ },
    "cause": "ERROR_SENDING_ANSWER",
    "causeCode": 666
  }
}
```

#### Error Sending Attach
```json
{
  "method": "verto.bye",
  "params": {
    "sessid": "session-id",
    "dialogParams": { /* ... */ },
    "cause": "ERROR_SENDING_ATTACH",
    "causeCode": 666
  }
}
```

### Error Causes

- **ERROR_SETTING_REMOTE_SDP**: Failed to set the remote session description during WebRTC negotiation
- **ERROR_SENDING_ANSWER**: Failed to send an answer message to the server
- **ERROR_SENDING_ATTACH**: Failed to send an attach message to the server

All error causes use the special error code `666` to distinguish them from standard telephony cause codes.

## License

Copyright © 2018-2019 SignalWire. It is free software, and may be redistributed under the terms specified in the MIT-LICENSE file.
