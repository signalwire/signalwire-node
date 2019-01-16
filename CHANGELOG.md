# Changelog
All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Moderator methods on the Dialog object.
- Get/Set default RTC devices.
### Removed
- Conference's channels have been removed from the `conferenceUpdate` join & leave notification type (chatChannel / infoChannel / conferenceChannel).

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

## [1.0.0-rc.1] - 2018-12-05
## First Release!

### Added
### Changed
### Removed
### Fixed
### Security
