# SignalWire

This package provides a client for Signalwire services and supports different Javascript environments.

[![npm version](https://badge.fury.io/js/signalwire.svg)](https://badge.fury.io/js/signalwire)

![Drone CI](https://ci.signalwire.com/api/badges/signalwire/signalwire-node/status.svg)

### Packages

| Project | Description | Links |
| ------- | ------- |:-----:|
| **Node.js** | SignalWire in a server Node | [`README.md`](packages/node/README.md)
| **Web** | SignalWire in the browser | [`README.md`](packages/web/README.md)
| **React Native** | SignalWire in a React Native App | **coming soon**

### Development setup
To start working you need a few things:
- Install [Node.js](https://nodejs.org/en/)
- Clone the repository
- Install dependencies
```
cd signalwire-client-js
npm install
```

### Build versions
To build all the different version of the package (CommonJS, Es5, Es6):

```
npm run clean-build
```

To build only one version you can:
```
npm run build-es5
npm run build-es6
npm run build-node
```

### Tests

Since `Browsers` and `Node.js` are different environment, we provide tests to run in both environments:
```
npm run test:web
npm run test:node
```

A Dockerfile is provided for testing purposes. Run `docker run -it $(docker build -q .)` to execute the test suite.

## Copyright

Copyright (c) 2018 SignalWire Inc. See [LICENSE](https://github.com/signalwire/signalwire-node/blob/master/LICENSE) for further details.
