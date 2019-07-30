# Signalwire Electron Call Demo

This demo allows you to build an [Electron](https://electronjs.org/) app and make calls to Web Browsers, SIP Endpoints or Phone Numbers from your SignalWire project.

Visit [Relay SDK for JavaScript Documentation](https://docs.signalwire.com/topics/relay-sdk-js) for more information and documentation.

## To Get Started

1. Follow the [Getting Started](https://docs.signalwire.com/topics/relay-sdk-js#relay-sdk-for-javascript-using-the-sdk) steps in the JavaScript SDK Documentation to generate a JSON Web Token for your project.

2. Fill in your Project ID and JWT inside `./src/app.jsx` (Lines 18-19).

3. Run the following commands to install the dependencies and `start` the dev Electron app:

    ```sh
    yarn
    yarn start
    ```

You'll have the Electron app running in development on your local machine and you can start make calls.

## Troubleshooting

Make sure you have [yarn](https://yarnpkg.com/lang/en/) installed and the `3 item` of the list above installed all the NPM packages required for the App.
