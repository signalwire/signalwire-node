import { ICantinaAuthParams, ICantinaUser } from './interfaces'
import logger from '../util/logger'

type BootstrapResponse = { project_id: string }
type RefreshResponse = { jwt_token: string }

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

  private _fetch = (url: RequestInfo, options: RequestInit) => {
    return fetch(url, options).then(async (response: Response) => {
      const payload = await response.json()
      if (response.status >= 200 && response.status < 300) {
        return payload
      } else {
        const errorMessage = `HTTP Request failed with status ${response.status}`
        const error = new Error(errorMessage)
        // @ts-ignore
        error.payload = payload
        return Promise.reject(error)
      }
    })
  }

  async bootstrap(): Promise<BootstrapResponse> {
    const url = new URL(`${this.baseUrl}/api/configuration`)
    url.search = new URLSearchParams({ hostname: this.hostname }).toString()
    const response = await this._fetch(url.href, {
      ...FETCH_OPTIONS,
      method: 'GET',
    })
    logger.info('bootstrap response', response)
    return response
  }

  async login(username: string, project_id: string): Promise<ICantinaUser> {
    const response = await this._fetch(`${this.baseUrl}/api/login`, {
      ...FETCH_OPTIONS,
      body: JSON.stringify({ username, project_id })
    })
    logger.info('userLogin response', response)
    return response
  }

  async refresh(): Promise<RefreshResponse> {
    const response = await this._fetch(`${this.baseUrl}/api/refresh`, {
      ...FETCH_OPTIONS,
      method: 'PUT',
    })
    logger.info('refresh response', response)
    return response
  }

  async logout(): Promise<void> {
    const response = await this._fetch(`${this.baseUrl}/api/logout`, {
      ...FETCH_OPTIONS,
      method: 'PUT'
    })
    logger.info('logout response', response)
    return response
  }
}

export default CantinaAuth
