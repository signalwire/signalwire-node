import CantinaAuth from '../../src/webrtc/CantinaAuth'

declare var global: any;

const mockFetchSuccess = (data?: object) => {
  return jest.fn().mockImplementationOnce(() => Promise.resolve({
    ok: true,
    status: 200,
    json: () => data
  }))
}

const mockFetchFailure = (error: object) => {
  return jest.fn().mockImplementationOnce(() => Promise.resolve({
    ok: false,
    status: 422,
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
  const errorResponse = {
    errors: [{ detail: 'Unauthorized', code: '401' }]
  }

  let auth: CantinaAuth = null
  beforeEach(() => {
    auth = new CantinaAuth()
  })

  describe('bootstrap', () => {
    it('should expose bootstrap to get jwt for a user', async () => {
      global.fetch = mockFetchSuccess({ project_id: 'uuid' })
      const response = await auth.bootstrap(hostname)

      expect(response.project_id).toEqual('uuid')
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(`${auth.baseUrl}/api/configuration?hostname=jest.relay.com`, {
        ...DEFAULT_FETCH_OPTIONS,
        method: 'GET',
      })
    })

    it('should clear the hostname', async () => {
      global.fetch = mockFetchSuccess({ project_id: 'uuid' })
      auth.hostname = 'some weird \' hostname . com'
      const clear = new URLSearchParams({ hostname: auth.hostname }).toString()
      const response = await auth.bootstrap(auth.hostname)
      expect(response.project_id).toEqual('uuid')
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(`${auth.baseUrl}/api/configuration?${clear}`, {
        ...DEFAULT_FETCH_OPTIONS,
        method: 'GET',
      })
    })

    it('should return the error if fetch failed', async () => {
      global.fetch = mockFetchFailure(errorResponse)

      expect.assertions(2)
      await expect(auth.bootstrap(hostname)).rejects.toEqual(expect.any(Error))
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('login', () => {
    it('should expose login to get jwt for a user', async () => {
      global.fetch = mockFetchSuccess({ jwt_token: 'user-jwt' })
      const response = await auth.login('username', 'project-id')

      expect(response.jwt_token).toEqual('user-jwt')
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(`${auth.baseUrl}/api/login`, {
        ...DEFAULT_FETCH_OPTIONS,
        body: '{"username":"username","project_id":"project-id"}'
      })
    })

    it('should return the error if fetch failed', async () => {
      global.fetch = mockFetchFailure(errorResponse)

      expect.assertions(2)
      await expect(auth.login('username', 'project-id')).rejects.toEqual(expect.any(Error))
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  // describe('guestLogin', () => {
  //   it('should expose guestLogin to get jwt for a guest', async () => {
  //     global.fetch = mockFetchSuccess({ jwt_token: 'guest-jwt', scopes: ['scope3'] })

  //     const response = await auth.guestLogin('name', 'email', 'uuid')
  //     expect(response.jwt_token).toEqual('guest-jwt')
  //     expect(response.scopes).toEqual(['scope3'])
  //     expect(global.fetch).toHaveBeenCalledTimes(1)
  //     expect(global.fetch).toHaveBeenCalledWith(`${auth.baseUrl}/api/login/guest`, {
  //       ...DEFAULT_FETCH_OPTIONS,
  //       body: '{"name":"name","email":"email","token":"uuid","hostname":"jest.relay.com"}'
  //     })
  //   })

  //   it('should return the error if fetch failed', async () => {
  //     global.fetch = mockFetchFailure(errorResponse)

  //     expect.assertions(2)
  //     await expect(auth.guestLogin('name', 'email', 'uuid')).rejects.toEqual(expect.any(Error))
  //     expect(global.fetch).toHaveBeenCalledTimes(1)
  //   })
  // })

  describe('refresh', () => {
    it('should request to refresh the JWT', async () => {
      global.fetch = mockFetchSuccess({ jwt_token: 'new-jwt' })

      const response = await auth.refresh()
      expect(response.jwt_token).toEqual('new-jwt')
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(`${auth.baseUrl}/api/refresh`, {
        ...DEFAULT_FETCH_OPTIONS,
        method: 'PUT',
      })
    })

    it('should request to refresh the JWT with body', async () => {
      global.fetch = mockFetchSuccess({ jwt_token: 'new-jwt' })
      const refresh_token = 'refresh-token'
      const response = await auth.refresh(refresh_token)
      expect(response.jwt_token).toEqual('new-jwt')
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(`${auth.baseUrl}/api/refresh`, {
        ...DEFAULT_FETCH_OPTIONS,
        method: 'PUT',
        body: JSON.stringify({ refresh_token })
      })
    })

    it('should return the error if fetch failed', async () => {
      global.fetch = mockFetchFailure(errorResponse)

      expect.assertions(2)
      await expect(auth.refresh()).rejects.toEqual(expect.any(Error))
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  // describe('checkInviteToken', () => {
  //   it('should expose checkInviteToken to validate an invite-token from URL', async () => {
  //     global.fetch = mockFetchSuccess({ valid: true, name: 'room name', config: {} })

  //     const response = await auth.checkInviteToken('uuid')

  //     expect(response.valid).toEqual(true)
  //     expect(response.name).toEqual('room name')
  //     expect(global.fetch).toHaveBeenCalledTimes(1)
  //     expect(global.fetch).toHaveBeenCalledWith(`${auth.baseUrl}/api/check-token`, {
  //       ...DEFAULT_FETCH_OPTIONS,
  //       body: '{"token":"uuid","hostname":"jest.relay.com"}'
  //     })
  //   })

  //   it('should return the error if fetch failed', async () => {
  //     global.fetch = mockFetchFailure(errorResponse)

  //     expect.assertions(2)
  //     await expect(auth.checkInviteToken('uuid')).rejects.toEqual(expect.any(Error))
  //     expect(global.fetch).toHaveBeenCalledTimes(1)
  //   })
  // })

  describe('logout', () => {
    it('should request to logout the JWT', async () => {
      global.fetch = mockFetchSuccess()
      await auth.logout()
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(`${auth.baseUrl}/api/logout`, {
        ...DEFAULT_FETCH_OPTIONS,
        method: 'PUT'
      })
    })

    it('should return the error if fetch failed', async () => {
      global.fetch = mockFetchFailure(errorResponse)

      expect.assertions(2)
      await expect(auth.logout()).rejects.toEqual(expect.any(Error))
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })
})
