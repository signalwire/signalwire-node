import client from './client'
const mockServer = require('mockttp').getLocal()

describe('RestClient', function () {
  beforeEach(async () => {
    await mockServer.start()
    client.api.baseUrl = mockServer.url
  })

  afterEach(() => mockServer.stop())

  describe('Calls', function () {
    const BASE_URL = `/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Calls.json`

    it('should create a call', async done => {
      const RESPONSE = '{"sid":"82e7850d-054e-4067-8c4f-6568acd96575","date_created":"Sun, 03 Feb 2019 21:36:05 +0000","date_updated":"Sun, 03 Feb 2019 21:36:05 +0000","parent_call_sid":null,"account_sid":"XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX","to":"+11111111112","formatted_to":"111-111-112","to_formatted":"111-111-112","from":"+11111111111","formatted_from":"111-111-111","from_formatted":"111-111-111","phone_number_sid":"XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX","status":"queued","start_time":null,"end_time":null,"duration":0,"price":null,"price_unit":"USD","direction":"outbound-api","answered_by":null,"api_version":"2010-04-01","forwarded_from":null,"caller_name":null,"uri":"/api/laml/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Calls/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX","subresource_uris":{"notifications":null,"recordings":"/api/laml/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Calls/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Recordings"},"annotation":null,"group_sid":null}'
      await mockServer.post(BASE_URL).thenReply(200, RESPONSE)

      const call = await client.calls.create({
        url: 'http://example.signalwire.com/laml/voice.xml',
        from: '+11111111111',
        to: '+11111111112'
      }).catch(_error => {})

      expect(call.sid).toEqual('82e7850d-054e-4067-8c4f-6568acd96575')
      expect(call.fromFormatted).toEqual('111-111-111')
      expect(call.toFormatted).toEqual('111-111-112')

      done()
    })

    it('should list the calls', async done => {
      const RESPONSE = '{"uri":"/api/laml/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Calls?Page=0\u0026PageSize=50","first_page_uri":"/api/laml/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Calls?Page=0\u0026PageSize=50","next_page_uri":null,"previous_page_uri":null,"page":0,"page_size":50,"calls":[{"sid":"82e7850d-054e-4067-8c4f-6568acd96575","date_created":"Sun, 03 Feb 2019 18:21:34 +0000","date_updated":"Sun, 03 Feb 2019 18:21:37 +0000","parent_call_sid":null,"account_sid":"XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX","to":"+11111111112","formatted_to":"111-111-1112","to_formatted":"111-111-1112","from":"+11111111111","formatted_from":"111-111-1111","from_formatted":"111-111-1111","phone_number_sid":"XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX","status":"completed","start_time":"Sun, 03 Feb 2019 18:21:36 +0000","end_time":"Sun, 03 Feb 2019 18:21:37 +0000","duration":1,"price":0.0065,"price_unit":"USD","direction":"outbound-api","answered_by":null,"api_version":"2010-04-01","forwarded_from":null,"caller_name":null,"uri":"/api/laml/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Calls/82e7850d-054e-4067-8c4f-6568acd96575","subresource_uris":{"notifications":null,"recordings":"/api/laml/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Calls/82e7850d-054e-4067-8c4f-6568acd96575/Recordings"},"annotation":null,"group_sid":null}]}'
      const endpointMock = await mockServer.get(BASE_URL).thenReply(200, RESPONSE)
      const list = await client.calls.list().catch(_error => [])
      const requests = await endpointMock.getSeenRequests()
      expect(requests[0].url).toEqual(BASE_URL)
      expect(list.length).toEqual(1)
      expect(list[0].sid).toEqual('82e7850d-054e-4067-8c4f-6568acd96575')

      done()
    })

    it('should get a call instance', async done => {
      const RESPONSE = '{"sid":"82e7850d-054e-4067-8c4f-6568acd96575","date_created":"Sun, 03 Feb 2019 21:36:05 +0000","date_updated":"Sun, 03 Feb 2019 21:36:05 +0000","parent_call_sid":null,"account_sid":"XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX","to":"+11111111112","formatted_to":"111-111-112","to_formatted":"111-111-112","from":"+11111111111","formatted_from":"111-111-111","from_formatted":"111-111-111","phone_number_sid":"XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX","status":"queued","start_time":null,"end_time":null,"duration":0,"price":null,"price_unit":"USD","direction":"outbound-api","answered_by":null,"api_version":"2010-04-01","forwarded_from":null,"caller_name":null,"uri":"/api/laml/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Calls/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX","subresource_uris":{"notifications":null,"recordings":"/api/laml/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Calls/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Recordings"},"annotation":null,"group_sid":null}'
      const url = '/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Calls/82e7850d-054e-4067-8c4f-6568acd96575.json'
      await mockServer.get(url).thenReply(200, RESPONSE)

      const call = await client.calls('82e7850d-054e-4067-8c4f-6568acd96575').fetch().catch(_error => { })

      expect(call.sid).toEqual('82e7850d-054e-4067-8c4f-6568acd96575')
      expect(call.fromFormatted).toEqual('111-111-111')
      expect(call.toFormatted).toEqual('111-111-112')

      done()
    })
  })

  // it('should list the faxes', done => {
  //   client.fax.faxes.list()
  //     .then(faxes => {
  //       expect(faxes.length).toEqual(7)
  //       expect(faxes[0].sid).toEqual('dd3e1ac4-50c9-4241-933a-5d4e9a2baf31')
  //     })
  //     .catch(error => {
  //       console.error('handle error?', error)
  //     })
  //     .then(done)
  // })

  // it('should get a fax instance', done => {
  //   client.fax.faxes('831455c6-574e-4d8b-b6ee-2418140bf4cd').fetch()
  //     .then(fax => {
  //       expect(fax.to).toEqual('+14044455666')
  //     })
  //     .catch(error => {
  //       console.error('handle error?', error)
  //     })
  //     .then(done)
  // })
});
