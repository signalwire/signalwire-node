import { getHost } from '../../src/rest/helpers'

describe('getHost', () => {
  beforeEach(() => {
    delete process.env.SIGNALWIRE_SPACE_URL
    delete process.env.SIGNALWIRE_API_HOSTNAME
  })

  it('should return signalwireSpaceUrl without ENV vars', () => {
    const res = getHost({ signalwireSpaceUrl: 'changeme.signalwire.com' })
    expect(res).toEqual('changeme.signalwire.com')
  })

  it('should return signalwireSpaceUrl with ENV vars', () => {
    process.env.SIGNALWIRE_SPACE_URL = 'env.signalwire.com'
    const res = getHost({ signalwireSpaceUrl: 'changeme.signalwire.com' })
    expect(res).toEqual('changeme.signalwire.com')
  })

  it('should return SIGNALWIRE_SPACE_URL env variable if present', () => {
    process.env.SIGNALWIRE_SPACE_URL = 'url.signalwire.com'
    const res = getHost()
    expect(res).toEqual('url.signalwire.com')
  })

  it('should return SIGNALWIRE_API_HOSTNAME env variable if present', () => {
    process.env.SIGNALWIRE_API_HOSTNAME = 'host.signalwire.com'
    const res = getHost()
    expect(res).toEqual('host.signalwire.com')
  })

  it('should throw an error without host', () => {
    expect(() => {
      getHost()
    }).toThrowError(/missing signalwire/i)
  })
})
