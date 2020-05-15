import { ICantinaUser } from './interfaces'
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
  public baseUrl = ''
  public hostname: string

  private _fetch = (url: RequestInfo, options: RequestInit) => {
    return fetch(url, options).then(async (response: Response) => {
      if (response.status >= 200 && response.status < 300) {
        if (response.status === 204) {
          return response
        }
        const payload = await response.json()
        return payload
      } else {
        const errorMessage = `HTTP Request failed with status ${response.status}`
        const error = new Error(errorMessage)
        // @ts-ignore
        error.response = response
        return Promise.reject(error)
      }
    })
  }

  async bootstrap(hostname: string): Promise<BootstrapResponse> {
    const clear = encodeURIComponent(hostname)
    const url = `${this.baseUrl}/api/configuration?hostname=${clear}`
    const response = await this._fetch(url, {
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

  async refresh(refreshToken = null): Promise<RefreshResponse> {
    const options: RequestInit = {
      ...FETCH_OPTIONS,
      method: 'PUT',
    }
    if (refreshToken) {
      options.body = JSON.stringify({ refresh_token: refreshToken })
    }
    const response = await this._fetch(`${this.baseUrl}/api/refresh`, options)
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
