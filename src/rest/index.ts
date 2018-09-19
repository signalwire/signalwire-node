const twilio = require('twilio')

const RestClient = function(username, token, opts) {
  if (!process.env.hasOwnProperty('SIGNALWIRE_API_HOSTNAME')) {
    throw new Error('Missing SIGNALWIRE_API_HOSTNAME environment variable.')
  }

  // "AC" prefix because twilio-node requires it
  const client = new twilio.Twilio('AC' + username, token, opts)
  // Remove "AC" prefix
  client.username = username || process.env.SIGNALWIRE_API_PROJECT
  client.accountSid = username || process.env.SIGNALWIRE_API_PROJECT
  client.password = token || process.env.SIGNALWIRE_API_TOKEN
  // Replace base url
  client.api.baseUrl = 'https://' + process.env.SIGNALWIRE_API_HOSTNAME

  return client
}

// Define old properties
const properties = Object.getOwnPropertyNames(twilio)
for (let i = 0; i < properties.length; i++) {
  const newProp = properties[i] === 'twiml' ? 'LaML' : properties[i]
  Object.defineProperty(RestClient, newProp, { value: twilio[properties[i]] })
}

export default RestClient