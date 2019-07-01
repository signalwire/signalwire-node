# React Native Calling Demo

This demo allows you to make calls between two React Native Apps, SIP Endpoints, Phone Numbers or web browsers.

Visit [Relay SDK for React Native Documentation](https://docs.signalwire.com/topics/relay-sdk-react-native) for more information and documentation.

## To Get Started

1. Follow the [React Native CLI Quickstart](https://facebook.github.io/react-native/docs/getting-started#installing-dependencies) steps to setup your React Native environment. Follow the proper steps if you are on _macOS_, _Windows_ or _Linux_ and for the target OS: _iOS_ or _Android_.

2. Run the following command to install the dependencies and link native libraries to both iOS and Android projects:
    ```sh
    npm install
    react-native link
    ```

3. Follow the [Getting Started](https://docs.signalwire.com/topics/relay-sdk-react-native#relay-sdk-for-react-native-using-the-sdk) steps in the SDK Documentation to generate a JSON Web Token for your project.

4. Fill in your Project ID and JWT in `App.js`: https://github.com/signalwire/signalwire-node/blob/0585ea646908ea1768c1f228230bfe4de0b8d700/packages/react-native/examples/VanillaCalling/App.js#L41-L44

5. Run the demo on your device with: `react-native run-android` or `react-native run-ios`.

> Note: WebRTC applications on _iOS_ must be tested on real devices because the simulator does not support microphone and camera. There are some Android emulators that give access to camera but we recommend to test using real devices.

You'll now be able to dial other Apps and SIP endpoints from your SignalWire project, as well as dial out to phone numbers.

## Troubleshooting

If you have any trouble building the App follow the steps for each native library:

#### iOS

- Instructions for [react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc/blob/master/Documentation/iOSInstallation.md#ios-installation)
- Instructions for [react-native-incall-manager](https://github.com/react-native-webrtc/react-native-incall-manager#ios)
- Instructions for [async-storage](https://github.com/react-native-community/async-storage/blob/LEGACY/docs/Linking.md#ios)

#### Android

- Instructions for [react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc/blob/master/Documentation/AndroidInstallation.md)
- Instructions for [react-native-incall-manager](https://github.com/react-native-webrtc/react-native-incall-manager#android)
- Instructions for [async-storage](https://github.com/react-native-community/async-storage/blob/LEGACY/docs/Linking.md#android)
