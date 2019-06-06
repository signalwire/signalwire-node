# SignalWire React Native

[![Build Status](https://ci.signalwire.com/api/badges/signalwire/signalwire-node/status.svg)](https://ci.signalwire.com/signalwire/signalwire-node) ![NPM](https://img.shields.io/npm/v/@signalwire/react-native.svg?color=brightgreen)

The Relay SDK for React Native enables developers to connect and use SignalWire's Relay APIs within their own React Native apps. Our Relay SDK allows developers to build or add robust and innovative communication services to their applications.

## Getting Started

Coming soon..

## WebRTC Engine

Our package `@signalwire/react-native` depends on [react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc) and will try to install it automatically for you in the `postinstall` script.\
It's possible that an error will occur during the linking process of the native libraries. If your app does not compile, follow these steps to troubleshoot:

- [iOS](https://github.com/react-native-webrtc/react-native-webrtc/blob/master/Documentation/iOSInstallation.md)
- [Android](https://github.com/react-native-webrtc/react-native-webrtc/blob/master/Documentation/AndroidInstallation.md)

> Make sure to check the app permissions in `AndroidManifest.xml` and `Info.plist` to access the device camera and microphone!

---

## Contributing

Relay SDK for React Native is open source and maintained by the SignalWire team, but we are very grateful for [everyone](https://github.com/signalwire/signalwire-node/contributors) who has contributed and assisted so far.

If you'd like to contribute, feel free to visit our [Slack channel](https://signalwire.community/) and read our developer section to get the code running in your local environment.

## Developers

The React Native SDK is a package inside the [signalwire-node](https://github.com/signalwire/signalwire-node) _monorepo_. To setup the dev environment follow these steps:

1. [Download the installer](https://nodejs.org/) for the LTS version of Node.js. This is the best way to also [install npm](https://blog.npmjs.org/post/85484771375/how-to-install-npm#_=_).
2. Fork the [signalwire-node](https://github.com/signalwire/signalwire-node) repository and clone it.
3. Create a new branch from `master` for your change.
4. Run `npm install` to install global dependencies.
5. Run `npm run setup react-native` to prepare the React Native package.
6. Navigate into the react-native directory with `cd packages/react-native`.
7. Make changes!

## Versioning

Relay SDK for React Native follows Semantic Versioning 2.0 as defined at <http://semver.org>.

## License

Relay SDK for React Native is copyright © 2018-2019
[SignalWire](http://signalwire.com). It is free software, and may be redistributed under the terms specified in the [MIT-LICENSE](https://github.com//signalwire/signalwire-node/blob/master/LICENSE) file.
