# Changelog
All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2019-08-22
### Fixed
- Try to re-establish the previous protocol only if the signature has not changed.
### Security
- Update dependencies

## [1.2.0-beta.1] - 2019-08-02
### Added
- New methods to manage browser devices: `getDevices()`, `getVideoDevices()`, `getAudioInDevices()`, `getAudioOutDevices()`.
### Deprecated
- Deprecated getters to retrieve cached values for devices: `devices`, `videoDevices`, `audioInDevices`, `audioOutDevices`.
- Deprecated `refreshDevices()` method to refresh cached devices. Use `getDevices()` instead.

## [1.1.3] - 2019-07-31
### Changed
- Auto-discover webrtc devices if all `deviceIds` or `labels` are empty. (Help on Safari)

## [1.1.2] - 2019-07-17
### Fixed
- Fix reconnection logic on Verto client.

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
