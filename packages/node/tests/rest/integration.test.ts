import client from './client'
const mockServer = require('mockttp').getLocal()

describe('RestClient', () => {
  beforeEach(async () => {
    await mockServer.start()
    client.api.baseUrl = mockServer.url

    client.fax.baseUrl = mockServer.url
    client.fax.v1._version = `2010-04-01/Accounts/${client.accountSid}`
  })

  afterEach(() => mockServer.stop())

  describe('Calls', () => {
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

  describe('Faxes', () => {
    const BASE_URL = `/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Faxes`

    it('should create a fax', async done => {
      const RESPONSE = '{"account_sid":"XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX","api_version":"v1","date_created":"2019-02-03T18:30:37Z","date_updated":"2019-02-03T18:30:49Z","direction":"outbound","from":"+11111111112","media_url":"https://s3.us-east-2.amazonaws.com/signalwire-assets/faxes/20190203183038-0b9df3ce-0e93-4e94-a386-a8f1a22e59bb.tiff","media_sid":"45adb4dc-9ecc-49ce-8c43-ff478fcf274c","num_pages":0,"price":0.009,"price_unit":"USD","quality":"fine","sid":"0b9df3ce-0e93-4e94-a386-a8f1a22e59bb","status":"failed","to":"+11111111111","duration":9,"links":{"media":"/api/laml/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Faxes/0b9df3ce-0e93-4e94-a386-a8f1a22e59bb/Media"},"url":"/api/laml/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Faxes/0b9df3ce-0e93-4e94-a386-a8f1a22e59bb"}'
      await mockServer.post(BASE_URL).thenReply(200, RESPONSE)

      const call = await client.fax.faxes.create({
        mediaUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        from: '+11111111111',
        to: '+11111111112'
      }).catch(_error => { })

      expect(call.sid).toEqual('0b9df3ce-0e93-4e94-a386-a8f1a22e59bb')
      expect(call.to).toEqual('+11111111111')
      expect(call.from).toEqual('+11111111112')

      done()
    })

    it('should list the faxes', async done => {
      const RESPONSE = '{"uri":"/api/laml/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Faxes?Page=0\u0026PageSize=50","first_page_uri":"/api/laml/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Faxes?Page=0\u0026PageSize=50","next_page_uri":null,"previous_page_uri":null,"page":0,"page_size":50,"faxes":[{"account_sid":"XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX","api_version":"v1","date_created":"2019-02-03T18:30:37Z","date_updated":"2019-02-03T18:30:49Z","direction":"outbound","from":"+11111111112","media_url":"https://s3.us-east-2.amazonaws.com/signalwire-assets/faxes/20190203183038-0b9df3ce-0e93-4e94-a386-a8f1a22e59bb.tiff","media_sid":"45adb4dc-9ecc-49ce-8c43-ff478fcf274c","num_pages":0,"price":0.009,"price_unit":"USD","quality":"fine","sid":"0b9df3ce-0e93-4e94-a386-a8f1a22e59bb","status":"failed","to":"+11111111111","duration":9,"links":{"media":"/api/laml/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Faxes/0b9df3ce-0e93-4e94-a386-a8f1a22e59bb/Media"},"url":"/api/laml/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Faxes/0b9df3ce-0e93-4e94-a386-a8f1a22e59bb"}]}'
      const endpointMock = await mockServer.get(BASE_URL).thenReply(200, RESPONSE)
      const list = await client.fax.faxes.list().catch(_error => { console.error(_error); return [] })
      const requests = await endpointMock.getSeenRequests()
      expect(requests[0].url).toEqual(BASE_URL)
      expect(list.length).toEqual(1)
      expect(list[0].sid).toEqual('0b9df3ce-0e93-4e94-a386-a8f1a22e59bb')

      done()
    })

    it('should get a fax instance', async done => {
      const RESPONSE = '{"account_sid":"XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX","api_version":"v1","date_created":"2019-02-03T18:30:37Z","date_updated":"2019-02-03T18:30:49Z","direction":"outbound","from":"+11111111112","media_url":"https://s3.us-east-2.amazonaws.com/signalwire-assets/faxes/20190203183038-0b9df3ce-0e93-4e94-a386-a8f1a22e59bb.tiff","media_sid":"45adb4dc-9ecc-49ce-8c43-ff478fcf274c","num_pages":0,"price":0.009,"price_unit":"USD","quality":"fine","sid":"0b9df3ce-0e93-4e94-a386-a8f1a22e59bb","status":"failed","to":"+11111111111","duration":9,"links":{"media":"/api/laml/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Faxes/0b9df3ce-0e93-4e94-a386-a8f1a22e59bb/Media"},"url":"/api/laml/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Faxes/0b9df3ce-0e93-4e94-a386-a8f1a22e59bb"}'
      const url = '/2010-04-01/Accounts/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/Faxes/0b9df3ce-0e93-4e94-a386-a8f1a22e59bb'
      await mockServer.get(url).thenReply(200, RESPONSE)

      const fax = await client.fax.faxes('0b9df3ce-0e93-4e94-a386-a8f1a22e59bb').fetch().catch(_error => { console.error(_error); return {} })

      expect(fax.sid).toEqual('0b9df3ce-0e93-4e94-a386-a8f1a22e59bb')
      expect(fax.from).toEqual('+11111111112')
      expect(fax.to).toEqual('+11111111111')

      done()
    })
  })
})
