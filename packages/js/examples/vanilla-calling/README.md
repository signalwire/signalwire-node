# Signalwire Call Demo

This demo allows you to make calls to other browsers, SIP Endpoints or Phone Numbers from your SignalWire project in your browser.

Visit [Relay SDK for JavaScript Documentation](https://docs.signalwire.com/topics/relay-sdk-js) for more information and documentation.

## To Get Started

1. Follow the [Getting Started](https://docs.signalwire.com/topics/relay-sdk-js#relay-sdk-for-javascript-using-the-sdk) steps in the JavaScript SDK Documentation to generate a JSON Web Token for your project.

1. Load the index.html file in your browser. You don't need to setup or run any HTTP servers, just double clicking the file or open it directly in your browser.

1. Fill in your Project ID and JWT. Click Connect and thats it!

You'll now be able to dial other web browsers and SIP endpoints from your SignalWire project, as well as dial out to phone numbers.

## Troubleshooting

If you notice any JavaScript errors in the console relating to `localStorage`, try unblocking 3rd Party Cookies. Some browsers mark localStorage Cookies as 3rd Party when being run from `file://`.
