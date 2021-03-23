import {
  BladeConnect,
  setAgentName,
  BladeReauthenticate,
  BladePing,
  BladePingResponse,
  BladeExecute,
  BladeDisconnectResponse,
} from './index'

jest.mock('uuid', () => {
  return {
    v4: jest.fn(() => 'mocked-uuid')
  };
});

describe('RPC Messages', () => {
  describe('BladeConnect', () => {
    it('should generate the message with token', function () {
      const authentication = { project: 'project', token: 'token' }
      const message = BladeConnect({ authentication })
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method: 'blade.connect',
        params: {
          authentication: { project: 'project', token: 'token' },
          version: { 'major': 2, 'minor': 5, 'revision': 0 },
          agent: null,
        }
      })
    })

    it('should generate the message using sub-params', function () {
      const authentication = { project: 'project', token: 'token' }
      const message = BladeConnect({ authentication, params: { protocol: 'old-proto', contexts: ['test'] } })
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method: 'blade.connect',
        params: {
          authentication: { project: 'project', token: 'token' },
          version: { 'major': 2, 'minor': 5, 'revision': 0 },
          agent: null,
          params: {
            protocol: 'old-proto',
            contexts: ['test'],
          },
        }
      })
    })

    it('should generate the message with jwt_token', function () {
      const authentication = { project: 'project', jwt_token: 'jwt' }
      const message = BladeConnect({ authentication })
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method: 'blade.connect',
        params: {
          authentication: { project: 'project', jwt_token: 'jwt' },
          version: { 'major': 2, 'minor': 5, 'revision': 0 },
          agent: null,
        }
      })
    })

    it('should generate the message using agent', function () {
      setAgentName('Jest Random Test')
      const authentication = { project: 'project', jwt_token: 'jwt' }
      const message = BladeConnect({ authentication })
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method: 'blade.connect',
        params: {
          authentication: { project: 'project', jwt_token: 'jwt' },
          version: { 'major': 2, 'minor': 5, 'revision': 0 },
          agent: 'Jest Random Test',
        }
      })
    })
  })

  describe('BladeReauthenticate', () => {
    it('should generate the message', function () {
      const message = BladeReauthenticate({ project: 'project', jwt_token: 'jwt' })
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method: 'blade.reauthenticate',
        params: {
          authentication: { project: 'project', jwt_token: 'jwt' },
        }
      })
    })
  })

  describe('BladePing', () => {
    it('should generate the message', function () {
      global.Date.now = jest.fn(() => 1581442824134)

      const message = BladePing()
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method: 'blade.ping',
        params: {
          timestamp: 1581442824134 / 1000,
        },
      })
    })

    it('should generate the response', function () {
      const message = BladePingResponse('uuid', 1234)
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'uuid',
        result: {
          timestamp: 1234,
        },
      })
    })
  })

  describe('BladeExecute', () => {
    it('should generate the message based on protocol and method', function () {
      const message = BladeExecute({ protocol: 'example', method: 'sum' })
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method: 'blade.execute',
        params: {
          protocol: 'example',
          method: 'sum',
        },
      })
    })

    it('should generate the message based on protocol, method and specific params', function () {
      const message = BladeExecute({ protocol: 'example', method: 'sum', params: { x: 3, y: 6 } })
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method: 'blade.execute',
        params: {
          protocol: 'example',
          method: 'sum',
          params: { x: 3, y: 6 },
        },
      })
    })
  })

  describe('BladeDisconnect', () => {
    it('should generate the response', function () {
      const message = BladeDisconnectResponse('uuid')
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'uuid',
        result: {},
      })
    })
  })
})
