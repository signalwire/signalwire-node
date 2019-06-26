# Changelog
All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Expose moderator methods on the Call object.
- A notification that belongs to a Call now contains a reference to the call itself.
- Set/Get default `localElement` for the client to handle the localStream for all calls.
- Set/Get default `remoteElement` for the client to handle the remoteStream for all calls.
- newCall() method now accepts `localElement` and `remoteElement` to override the default ones.
- Set default audio & video settings.
- Expose speedTest() method.
- Force SDP to use plan-b.
- Set default iceServers.
- User can now join conferences without audio & video.
- Expose static method uuid().
- Retrieve supported resolution during client init
- Add property `resolutions` to get supported resolutions.
- Add async method `refreshResolutions()` to refresh cached resolutions
### Changed
- client.connect() is now async to check browser permissions before open the websocket connection.
- client.supportedResolutions() now returns a device list for each resolution supported.
### Removed
- `chatChannel` / `infoChannel` / `conferenceChannel` have been removed from the `conferenceUpdate` notification (**join** & **leave** actions).
### Security
- Update dependencies

## [1.1.1] - 2019-06-26
### Fixed
- Update Call.localStream if microphone or webcam has changed.

## [1.0.0-rc.3] - 2018-12-18
### Fixed
- Bugfix to really accept both `passwd` and `password` on Verto client initialization.

## [1.0.0-rc.2] - 2018-12-11
### Added
- Accept both `passwd` and `password` to setup Verto client.
- Add `userVariables` object property on Verto init parameters.
- Add event `signalwire.notification`. See [Notification](https://github.com/signalwire/signalwire-client-js/wiki/Notification) for further details.
### Changed
- `client.newCall()` parameters are now camelCase instead of snake_case.
### Removed
- These events are no longer used. All of these will be supplied under `signalwire.notification` event callback.
  - `signalwire.verto.dialogChange`
  - `signalwire.verto.display`
  - `signalwire.verto.info`
  - `signalwire.verto.event`
  - `signalwire.verto.pvtEvent`
  - `signalwire.verto.clientReady`
- Removed callbacks from `client.newCall()`. Use global `signalwire.notification` event or `onNotification` callback.
  - onChange
  - onUserMediaError

<!---
### Added
### Changed
### Removed
### Fixed
### Security
-->
