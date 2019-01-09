const RestClient = require('..').RestClient
const path = require('path');
const { Polly } = require('@pollyjs/core');
const { setupPolly } = require('setup-polly-jest');
const NodeHttpAdapter = require('@pollyjs/adapter-node-http');
const FSPersister = require('@pollyjs/persister-fs');

const client = new RestClient(process.env.SIGNALWIRE_API_PROJECT, process.env.SIGNALWIRE_API_TOKEN);


Polly.register(NodeHttpAdapter);
Polly.register(FSPersister);

beforeEach(() => {
  jest.setTimeout(30000); // force timeout
  jest.resetModules();
});

let context = setupPolly({
  adapters: ['node-http'],
  persister: 'fs',
  persisterOptions: {
    fs: {
      recordingsDir: path.resolve(__dirname, '../__recordings__')
    }
  },
  matchRequestsBy: {
    headers: false,
    body: false,
    order: false
  }
});

describe('RestClient', function () {
  it('should list the calls', done => {
    client.calls.list()
      .then(calls => {
        expect(calls.length).toEqual(534)
      })
      .catch(error => {
        console.error('handle error?', error)
      })
      .then(done)
  });

  it('should list the faxes', done => {
    client.fax.faxes.list()
      .then(faxes => {
        expect(faxes.length).toEqual(7)
        expect(faxes[0].sid).toEqual('dd3e1ac4-50c9-4241-933a-5d4e9a2baf31')
      })
      .catch(error => {
        console.error('handle error?', error)
      })
      .then(done)
  })

  it('should get a fax instance', done => {
    client.fax.faxes('831455c6-574e-4d8b-b6ee-2418140bf4cd').fetch()
      .then(fax => {
        expect(fax.to).toEqual('+14044455666')
      })
      .catch(error => {
        console.error('handle error?', error)
      })
      .then(done)
  })
});
