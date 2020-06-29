# Changelog
All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2020-06-27
### Fixed
- Add `react-native-get-random-values` to solve [this issue](https://github.com/uuidjs/uuid#getrandomvalues-not-supported).

## [1.0.2] - 2020-04-02
### Fixed
- Keep trying to reconnect WS in case of network failure - even if it never has been connected.

- ### Changed
- Remove autolinking of native modules in postinstall script.
- Export TypeScript interfaces for WebRTC call object.

### Security
- Update devDependencies

## [1.0.1] - 2019-10-15
### Added
- New methods to manage devices: `getDevices()`, `getVideoDevices()`, `getAudioInDevices()`, `getAudioOutDevices()`.
### Deprecated
- Deprecated getters to retrieve cached values for devices: `devices`, `videoDevices`, `audioInDevices`, `audioOutDevices`.
- Deprecated `refreshDevices()` method to refresh cached devices. Use `getDevices()` instead.
### Fixed
- Try to re-establish the previous protocol only if the signature has not changed.

## [1.0.0] - 2019-06-28
## First Release!

<!---
### Added
### Changed
### Removed
### Fixed
### Security
-->
