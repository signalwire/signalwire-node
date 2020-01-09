import { ICantinaAuthParams } from '../util/interfaces'
import logger from '../util/logger'

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

  async userLogin(username: string, password: string) {
    try {
      let response = await fetch(`${this.baseUrl}/login/user`, {
        ...FETCH_OPTIONS,
        body: JSON.stringify({ username, password, hostname: this.hostname })
      })
      response = await response.json()
      logger.info('userLogin response', response)
      return response
    } catch (error) {
      logger.error('userLogin invalid response', error)
    }
  }

  async guestLogin(name: string, email: string) {
    try {
      let response = await fetch(`${this.baseUrl}/login/guest`, {
        ...FETCH_OPTIONS,
        body: JSON.stringify({ name, email, hostname: this.hostname })
      })
      response = await response.json()
      logger.info('guestLogin response', response)
      return response
    } catch (error) {
      logger.error('guestLogin invalid response', error)
    }
  }

  async refresh() {
    try {
      let response = await fetch(`${this.baseUrl}/refresh`, {
        ...FETCH_OPTIONS,
        method: 'PUT',
        body: JSON.stringify({ hostname: this.hostname })
      })
      response = await response.json()
      logger.info('refresh response', response)
      return response
    } catch (error) {
      logger.error('refresh invalid response', error)
    }
  }
}

export default CantinaAuth
