# SignalWire SDK for Node.js and JavaScript

[![CI](https://github.com/signalwire/signalwire-node/actions/workflows/ci.yml/badge.svg)](https://github.com/signalwire/signalwire-node/actions/workflows/ci.yml)

This package provides a client for Signalwire services and supports different Javascript environments.

### Packages

| Project          | Description                      | README                                         | CHANGELOG                                            |                                       Version                                       |
| ---------------- | -------------------------------- | ---------------------------------------------- | ---------------------------------------------------- | :---------------------------------------------------------------------------------: |
| **Node.js**      | SignalWire in Node.js            | [`README.md`](packages/node/README.md)         | [`CHANGELOG.md`](packages/node/CHANGELOG.md)         |     ![NPM](https://img.shields.io/npm/v/@signalwire/node.svg?color=brightgreen)     |
| **JavaScript**   | SignalWire in the browser!       | [`README.md`](packages/js/README.md)           | [`CHANGELOG.md`](packages/js/CHANGELOG.md)           |  ![NPM](https://img.shields.io/npm/v/@signalwire/js/legacy.svg?color=brightgreen)   |
| **React Native** | SignalWire in a React Native App | [`README.md`](packages/react-native/README.md) | [`CHANGELOG.md`](packages/react-native/CHANGELOG.md) | ![NPM](https://img.shields.io/npm/v/@signalwire/react-native.svg?color=brightgreen) |

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
    "dialogParams": {
      /* ... */
    },
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
    "dialogParams": {
      /* ... */
    },
    "cause": "NORMAL_CLEARING",
    "causeCode": 50004
  }
}
```

#### Error Sending Answer

```json
{
  "method": "verto.bye",
  "params": {
    "sessid": "session-id",
    "dialogParams": {
      /* ... */
    },
    "cause": "NORMAL_CLEARING",
    "causeCode": 50001
  }
}
```

#### Error Sending Attach

```json
{
  "method": "verto.bye",
  "params": {
    "sessid": "session-id",
    "dialogParams": {
      /* ... */
    },
    "cause": "NORMAL_CLEARING",
    "causeCode": 50002
  }
}
```

### Error Cause Codes

- **REMOTE_SDP_ERROR_CAUSE_CODE 50004**: Failed to set the remote session description during WebRTC negotiation
- **EXECUTE_ANSWER_ERROR_CAUSE_CODE 50001**: Failed to send an answer message to the server
- **EXECUTE_ATTACH_ERROR_CAUSE_CODE 50002**: Failed to send an attach message to the server
- **EXECUTE_INVITE_ERROR_CAUSE_CODE 50003**: Failed to send an invite message to the server

All error causes use the special error code `666` to distinguish them from standard telephony cause codes.

## ICE Restart

The SDK supports automatic ICE restart when the ICE connection fails. This feature is opt-in and can be enabled via call options.

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoRestartIceOnFailure` | `boolean` | `false` | Enable automatic ICE restart when the connection fails |
| `maxIceRestartAttempts` | `number` | `3` | Maximum number of restart attempts before giving up |

### Usage Example

```javascript
const call = client.newCall({
  destinationNumber: '+1234567890',
  autoRestartIceOnFailure: true,
  maxIceRestartAttempts: 5,
})
```

### Behavior

When `autoRestartIceOnFailure` is enabled:
- The SDK monitors the ICE connection state
- If the state changes to `failed`, it automatically triggers an ICE restart
- The restart attempt counter increments with each failure
- Once `maxIceRestartAttempts` is reached, no further automatic restarts occur
- The counter resets when the connection succeeds (`connected` or `completed` state)

### Manual ICE Restart

You can also trigger an ICE restart manually on an active call:

```javascript
call.restartIce()
```

This is useful for implementing custom recovery logic or responding to network changes.

## License

Copyright © 2018-2026 SignalWire. It is free software, and may be redistributed under the terms specified in the MIT-LICENSE file.
