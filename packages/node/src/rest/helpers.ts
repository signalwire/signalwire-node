import { StringStringMap } from '../../../common/src/util/interfaces'
const twilio = require('twilio')

function Reject(reject) {
  this.reject = reject
  this._propertyName = 'reject'
}

Reject.prototype = Object.create(twilio.twiml.FaxResponse.prototype)
Reject.prototype.constructor = 'Reject'

const getHost = (opts: StringStringMap = {}): string => {
  const { signalwireSpaceUrl } = opts
  if (signalwireSpaceUrl) {
    return signalwireSpaceUrl
  }
  const { SIGNALWIRE_SPACE_URL, SIGNALWIRE_API_HOSTNAME } = process.env
  if (SIGNALWIRE_SPACE_URL) {
    return SIGNALWIRE_SPACE_URL
  }
  if (SIGNALWIRE_API_HOSTNAME) {
    return SIGNALWIRE_API_HOSTNAME
  }
  throw new Error('SignalWire Space URL is not configured.\nEnter your SignalWire Space domain via the SIGNALWIRE_SPACE_URL or SIGNALWIRE_API_HOSTNAME environment variables, or specifying the property "signalwireSpaceUrl" in the init options.')
}

export {
  getHost,
  Reject
}
