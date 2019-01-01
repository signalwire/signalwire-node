require('dotenv').config()

const RestClient = require('..').RestClient

describe('RestClient', function () {
  it('should call a number and return a call SID', function () {
    const client = new RestClient(process.env.SIGNALWIRE_API_PROJECT, process.env.SIGNALWIRE_API_TOKEN);

    client.calls.create({
      url: 'http://demo.signalwire.com/laml/voice.xml',
      to: '+11111111111',
      from: process.env.SIGNALWIRE_TEST_NUMBER
    }).then(call => {
      expect(call).toHaveProperty('sid')
    });
  })

  it('should generate LaML', function () {
    const response = new RestClient.LaML.VoiceResponse()
    const from = process.env.SIGNALWIRE_TEST_NUMBER
    response.dial({ callerId: from }, '+11111111111')
    expect(response.toString()).toEqual(`<?xml version="1.0" encoding="UTF-8"?><Response><Dial callerId="${from}">+11111111111</Dial></Response>`)
  })

  it('can receive a fax', function () {
    const response = new RestClient.LaML.FaxResponse()
    response.receive({ action: '/receive/fax' })
    expect(response.toString()).toEqual('<?xml version="1.0" encoding="UTF-8"?><Response><Receive action=\"/receive/fax\"/></Response>')
  })

  it('can reject a fax', function () {
    const response = new RestClient.LaML.FaxResponse()
    response.reject()
    expect(response.toString()).toEqual('<?xml version="1.0" encoding="UTF-8"?><Response><Reject/></Response>')
  })
})
