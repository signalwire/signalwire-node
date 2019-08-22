# Changelog
All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
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
