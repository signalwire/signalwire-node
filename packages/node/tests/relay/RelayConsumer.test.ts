import RelayConsumer from '../../src/relay/RelayConsumer'

describe('RelayConsumer', () => {
  const PROJECT = 'project'
  const TOKEN = 'token'

  const noOp = () => {}
  /* tslint:disable-next-line */
  function setupConsumer(params): any {
    return new RelayConsumer(params)
  }

  it('should throw without project AND token', () => {
    expect(() => setupConsumer({ onIncomingCall: noOp })).toThrow()
  })

  it('should throw without project', () => {
    expect(() => setupConsumer({ token: TOKEN })).toThrow()

    expect(() => setupConsumer({ project: '', token: TOKEN })).toThrow()
  })

  it('should throw without token', () => {
    expect(() => setupConsumer({ project: PROJECT })).toThrow()

    expect(() => setupConsumer({ project: PROJECT, token: '' })).toThrow()
  })

  it('should have no handler by default', () => {
    const consumer = setupConsumer({
      project: PROJECT,
      token: TOKEN
    })
    expect(consumer.onIncomingCall).toBeUndefined()
    expect(consumer.onIncomingFax).toBeUndefined()
    expect(consumer.onTask).toBeUndefined()
  })

  it('should set onIncomingCall handler', () => {
    const consumer = setupConsumer({
      project: PROJECT,
      token: TOKEN,
      onIncomingCall: noOp
    })
    expect(consumer.onIncomingCall).toBeInstanceOf(Function)
  })

  it('should set onIncomingFax handler', () => {
    const consumer = setupConsumer({
      project: PROJECT,
      token: TOKEN,
      onIncomingFax: noOp
    })
    expect(consumer.onIncomingFax).toBeInstanceOf(Function)
  })

  it('should set onTask handler', () => {
    const consumer = setupConsumer({
      project: PROJECT,
      token: TOKEN,
      onTask: noOp
    })
    expect(consumer.onTask).toBeInstanceOf(Function)
  })
})
