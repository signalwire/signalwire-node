import { ICantinaAuthParams } from '../util/interfaces'
import logger from '../util/logger'

type UserLoginResponse = { jwt_token: string, scopes: string[], errors?: any[] }
type GuestLoginResponse = { jwt_token: string, scopes: string[], errors?: any[] }
type RefreshResponse = { jwt_token: string, refresh_token: string, errors?: any[] }

const FETCH_OPTIONS: RequestInit = {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
}

class CantinaAuth {
  public baseUrl = 'https://cantina-backend.signalwire.com' // TODO: change me
  public hostname: string

  constructor(private params: ICantinaAuthParams = {}) {
    const { hostname = location.hostname } = params
    this.hostname = hostname
  }

  async userLogin(username: string, password: string): Promise<UserLoginResponse> {
    const response = await fetch(`${this.baseUrl}/login/user`, {
      ...FETCH_OPTIONS,
      body: JSON.stringify({ username, password, hostname: this.hostname })
    })
    const payload = await response.json()
    logger.info('userLogin response', response.status, payload)
    return payload
  }

  async guestLogin(name: string, email: string): Promise<GuestLoginResponse> {
    const response = await fetch(`${this.baseUrl}/login/guest`, {
      ...FETCH_OPTIONS,
      body: JSON.stringify({ name, email, hostname: this.hostname })
    })
    const payload = await response.json()
    logger.info('guestLogin response', response.status, payload)
    return payload
  }

  async refresh(): Promise<RefreshResponse> {
    const response = await fetch(`${this.baseUrl}/refresh`, {
      ...FETCH_OPTIONS,
      method: 'PUT',
      body: JSON.stringify({ hostname: this.hostname })
    })
    const payload = await response.json()
    logger.info('response response', response.status, payload)
    return payload
  }
}

export default CantinaAuth
