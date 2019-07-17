# Changelog
All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Create your own Relay Tasks and enable `onTask` method on RelayConsumer to receive/handle them.

## [2.0.0] - 2019-07-16
### Added
- Add support for faxing. New call methods: `faxReceive`, `faxReceiveAsync`, `faxSend`, `faxSendAsync`.

## [2.0.0-rc.2] - 2019-07-10
### Added
- Add Relay calling `waitFor`, `waitForRinging`, `waitForAnswered`, `waitForEnding`, `waitForEnded` methods.

## [2.0.0-rc.1] - 2019-07-08
### Added
- Released new Relay Client interface.
- Add Relay Consumer.
- Handle SIGINT/SIGTERM signals.

## [1.2.1] - 2019-06-26
### Added
- Declaration files for TypeScript developers

## [1.2.0] - 2019-04-27
### Added
- Call `connect()` method.
- Call `record()` method.
- Call `playMedia()`, `playAudio()`, `playTTS()`, `playSilence()` methods.
- Call `playMediaAndCollect()`, `playAudioAndCollect()`, `playTTSAndCollect()`, `playSilenceAndCollect()` methods.
- Expose Call `play.*`, `record.*`, `collect` events.

## [1.1.0] - 2019-04-27
### Added
- Relay SDK to connect and use SignalWire's Relay APIs.
- Ability to set SignalWire Space URL in `RestClient` constructor via `signalwireSpaceUrl` property.

## [1.0.1] - 2019-03-12
### Fixed
- WSS endpoint for SignalWire spaces

## [1.0.0] - 2019-03-12
## First Release!

<!---
### Added
### Changed
### Removed
### Fixed
### Security
-->
