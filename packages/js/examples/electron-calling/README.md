# Signalwire Electron Call Demo

This demo allows you to build an [Electron](https://electronjs.org/) app and make calls to Web Browsers, SIP Endpoints or Phone Numbers from your SignalWire project.

Visit [Relay SDK for JavaScript Documentation](https://docs.signalwire.com/topics/relay-sdk-js) for more information and documentation.

## To Get Started

This Electron demo consist of a simple [React](https://reactjs.org/) application that can run in DEV mode (with `webpack-dev-server` locally), or you can build it and load the static assets from the `./dist` folder.

1. Follow the [Getting Started](https://docs.signalwire.com/topics/relay-sdk-js#relay-sdk-for-javascript-using-the-sdk) steps in the JavaScript SDK Documentation to generate a JSON Web Token for your project.

2. Fill in your Project ID and JWT inside `./src/App.js` (Lines 18-19).

3. Install the dependencies:
    ```sh
    npm install
    ```

4. Run in a shell the local `webpack-dev-server` (and visit [localhost:3000](http://localhost:3000/) to see the React App):

    ```sh
    npm run start:react
    ```
5. Run in another shell the Electron App:

    ```sh
    npm run start:electron
    ```

You'll have the Electron app loading the React one and you can start making calls.

> Note: if you want to load the static files instead of _localhost:3000_ follow these additional steps:

1. Build the application:
    ```sh
    npm run build:react
    ```

2. Switch lines 20/23 in `electron.js` file to instruct Electron where the `index.html` file is:
    ```
    mainWindow.loadURL(`file://${__dirname}/public/index.html`);

    // mainWindow.loadURL('http://localhost:3000/');
    ```

## Troubleshooting

Make sure all the dependencies were installed properly, the React loads properly using `webpack-dev-server` and `mainWindow.loadURL` in `electron.js` points to the proper location (webserver or static files).
