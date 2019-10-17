# Changelog
All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Add `url` property to `RecordAction`.
- Add methods to `pause` and `resume` a PlayAction.
- Ability to set volume playback on `play` and `prompt` methods, or through the asynchronous `PlayAction` and `PromptAction` objects.
- Add `playRingtone` and `playRingtoneAsync` methods to simplify play a ringtone.
- Add `promptRingtone` and `promptRingtoneAsync` methods to simplify play a ringtone.
- Support `ringback` option on `connect` and `connectAsync` methods.

## [2.2.0] - 2019-09-09
### Fixed
- Avoid `Unhandled promise rejection` error in case of Relay errors while registering contexts.

### Changed
- Minor change at the lower level APIs: using `calling.` instead of `call.` prefix for calling methods.
- Flattened parameters for _record_, _play_, _prompt_, _detect_ and _tap_ calling methods.
- Do not send a Relay request if the Call is ended, preventing the error "Call does not exists".

### Added
- New methods to perform answering machine detection: `amd` (alias to `detectAnsweringMachine`) and `amdAsync` (alias to `detectAnsweringMachineAsync`).
- Methods to send digits on a Call: `sendDigits`, `sendDigitsAsync`.

### Deprecated
- Deprecated the following methods on Call: `detectHuman`, `detectHumanAsync`, `detectMachine`, `detectMachineAsync`.

## [2.1.0] - 2019-07-30
### Added
- Create your own Relay Tasks and enable `onTask` method on RelayConsumer to receive/handle them.
- Methods to start a detector on a Call: `detect`, `detectAsync`, `detectHuman`, `detectHumanAsync`, `detectMachine`, `detectMachineAsync`, `detectFax`, `detectFaxAsync`, `detectDigit`, `detectDigitAsync`
- Methods to tap media in a Call: `tap` and `tapAsync`
- Support for Relay Messaging

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
