import CantinaAuth from '../../src/webrtc/CantinaAuth'

declare var global: any;

const mockFetchSuccess = (data: object) => {
  return jest.fn().mockImplementationOnce(() => Promise.resolve({
    ok: true,
    json: () => data
  }))
}

const mockFetchFailure = (error: object) => {
  return jest.fn().mockImplementationOnce(() => Promise.resolve({
    ok: false,
    json: () => error
  }))
}

const DEFAULT_FETCH_OPTIONS = {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
}

describe('CantinaAuth', () => {
  const hostname = 'jest.relay.com'

  it('should default the hostname from global location if not provided', () => {
    const authDef = new CantinaAuth()
    expect(authDef.hostname).toEqual('localhost')

    const authCustom = new CantinaAuth({ hostname })
    expect(authCustom.hostname).toEqual(hostname)

  })

  describe('userLogin', () => {
    it('should expose userLogin to get jwt for a user', async () => {
      global.fetch = mockFetchSuccess({ jwt_token: 'user-jwt', scopes: ['scope1', 'scope2'] })

      const auth = new CantinaAuth({ hostname })
      const response = await auth.userLogin('username', 'password')

      expect(response.jwt_token).toEqual('user-jwt')
      expect(response.scopes).toEqual(['scope1', 'scope2'])
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(`${auth.baseUrl}/login/user`, {
        ...DEFAULT_FETCH_OPTIONS,
        body: '{"username":"username","password":"password","hostname":"jest.relay.com"}'
      })
    })

    it('should return the error if fetch failed', async () => {
      global.fetch = mockFetchFailure({ errors: [{ detail: 'Unauthorized', code: '401' }] })

      const auth = new CantinaAuth({ hostname })
      const response = await auth.userLogin('username', 'password')

      expect(response.errors[0].code).toEqual('401')
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('guestLogin', () => {
    it('should expose guestLogin to get jwt for a guest', async () => {
      global.fetch = mockFetchSuccess({ jwt_token: 'guest-jwt', scopes: ['scope3'] })

      const auth = new CantinaAuth({ hostname })
      const response = await auth.guestLogin('name', 'email', 'uuid')

      expect(response.jwt_token).toEqual('guest-jwt')
      expect(response.scopes).toEqual(['scope3'])
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(`${auth.baseUrl}/login/guest`, {
        ...DEFAULT_FETCH_OPTIONS,
        body: '{"name":"name","email":"email","invite_token":"uuid","hostname":"jest.relay.com"}'
      })
    })

    it('should return the error if fetch failed', async () => {
      global.fetch = mockFetchFailure({ errors: [{ detail: 'Unauthorized', code: '401' }] })

      const auth = new CantinaAuth({ hostname })
      const response = await auth.guestLogin('name', 'email', 'uuid')

      expect(response.errors[0].code).toEqual('401')
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('refresh', () => {
    it('should request to refresh the JWT', async () => {
      global.fetch = mockFetchSuccess({ jwt_token: 'new-jwt', refresh_token: 'refresh_token' })

      const auth = new CantinaAuth({ hostname })
      const response = await auth.refresh()

      expect(response.jwt_token).toEqual('new-jwt')
      expect(response.refresh_token).toEqual('refresh_token')
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(`${auth.baseUrl}/refresh`, {
        ...DEFAULT_FETCH_OPTIONS,
        method: 'PUT',
        body: '{"hostname":"jest.relay.com"}'
      })
    })

    it('should return the error if fetch failed', async () => {
      global.fetch = mockFetchFailure({ errors: [{ detail: 'Unauthorized', code: '401' }] })

      const auth = new CantinaAuth({ hostname })
      const response = await auth.refresh()

      expect(response.errors[0].code).toEqual('401')
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })
})
