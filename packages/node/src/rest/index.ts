import { StringStringMap } from '../../../common/src/util/interfaces'
import { getHost, Reject } from './helpers'
const twilio = require('twilio')

twilio.twiml.FaxResponse.prototype.reject = function(attributes) {
  return new Reject(this.response.ele('Reject', attributes))
}

/* tslint:disable-next-line */
const RestClient = function (username: string, token: string, opts?: StringStringMap): void {
  const host = getHost(opts)
  // "AC" prefix because twilio-node requires it
  const client = new twilio.Twilio('AC' + username, token, opts)
  // Remove "AC" prefix
  client.username = username || process.env.SIGNALWIRE_API_PROJECT
  client.accountSid = username || process.env.SIGNALWIRE_API_PROJECT
  client.password = token || process.env.SIGNALWIRE_API_TOKEN
  // Replace base url
  client.api.baseUrl = `https://${host}`

  client.fax.baseUrl = `https://${host}`
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
