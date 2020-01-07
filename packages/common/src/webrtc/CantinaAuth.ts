import { ICantinaAuthParams } from '../util/interfaces'
import logger from '../util/logger'

const FETCH_OPTIONS = {
  headers: {
    'Content-Type': 'application/json'
  }
}

class CantinaAuth {
  public baseUrl: string
  public hostname: string

  constructor(private params: ICantinaAuthParams = {}) {
    const { hostname = location.hostname } = params
    this.hostname = hostname
    this.baseUrl = `https://${this.hostname}`
  }

  async userLogin(username: string, password: string) {
    const body = { username, password }
    try {
      let response = await fetch(`${this.baseUrl}/user-login`, {
        ...FETCH_OPTIONS,
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify(body)
      })
      response = await response.json()
      logger.info('userLogin response', response)
      return response
    } catch (error) {
      logger.error('userLogin invalid response', error)
    }
  }

  async guestLogin(name: string, email: string) {
    const body = { name, email }
    try {
      let response = await fetch(`${this.baseUrl}/guest-login`, {
        ...FETCH_OPTIONS,
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify(body)
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
      let response = await fetch(`${this.baseUrl}/refresh`, { method: 'PUT', credentials: 'include' })
      response = await response.json()
      logger.info('refresh response', response)
      return response
    } catch (error) {
      logger.error('refresh invalid response', error)
    }
  }
}

export default CantinaAuth
