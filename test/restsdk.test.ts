require('dotenv').config()

const RestClient = require('..').RestClient

describe('RestClient', function () {
  it('should call a number and return a call SID', function () {
    const client = new RestClient(process.env.SIGNALWIRE_API_PROJECT, process.env.SIGNALWIRE_API_TOKEN);

    client.calls.create({
      url: 'http://demo.signalwire.com/laml/voice.xml',
      to: '+14043287174',
      from: '+12083660792'
    }).then(call => {
      expect(call).toHaveProperty('sid')
    });
  })

  it('should generate LaML', function () {
    const response = new RestClient.LaML.VoiceResponse()
    response.dial({ callerId: '+1 (208) 366-0792' }, '+14043287174')
    expect(response.toString()).toEqual('<?xml version="1.0" encoding="UTF-8"?><Response><Dial callerId="+1 (208) 366-0792">+14043287174</Dial></Response>')
  })
})