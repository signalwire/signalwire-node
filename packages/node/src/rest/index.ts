const twilio = require('twilio')

twilio.twiml.FaxResponse.prototype.reject = function(attributes) {
  return new Reject(this.response.ele('Reject', attributes))
}

function Reject(reject) {
  this.reject = reject
  this._propertyName = 'reject'
}

Reject.prototype = Object.create(twilio.twiml.FaxResponse.prototype)
Reject.prototype.constructor = 'Reject'

const RestClient = (username, token, opts) => {
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

  client.fax.baseUrl = 'https://' + process.env.SIGNALWIRE_API_HOSTNAME
  client.fax.v1._version = `2010-04-01/Accounts/${client.accountSid}`

  return client
}

// Define old properties
const properties = Object.getOwnPropertyNames(twilio)
for (let i = 0; i < properties.length; i++) {
  const newProp = properties[i] === 'twiml' ? 'LaML' : properties[i]
  Object.defineProperty(RestClient, newProp, { value: twilio[properties[i]] })
}

export default RestClient
