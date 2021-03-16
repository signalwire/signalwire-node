import { BladeConnect, setAgentName, BladeReauthenticate, BladePing, BladeExecute } from './index'

jest.mock('uuid', () => {
  return {
    v4: jest.fn(() => 'mocked-uuid')
  };
});

describe('RPC Messages', () => {
  describe('BladeConnect', () => {
    it('should generate the message with token', function () {
      const message = BladeConnect({ project: 'project', token: 'token' })
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

    it('should generate the message with jwt_token', function () {
      const message = BladeConnect({ project: 'project', jwt_token: 'jwt' })
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
      const message = BladeConnect({ project: 'project', jwt_token: 'jwt' })
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
      const message = BladePing()
      expect(message).toStrictEqual({
        jsonrpc: '2.0',
        id: 'mocked-uuid',
        method: 'blade.ping',
        params: {},
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
})
