import RelayConsumer from '../../src/relay/RelayConsumer'

describe('RelayConsumer', () => {
  const PROJECT = 'project'
  const TOKEN = 'token'

  const noOp = () => {}
  /* tslint:disable-next-line */
  function setupConsumer(params): any {
    return new RelayConsumer(params)
  }

  it('should have no handler by default', () => {
    const consumer = setupConsumer({
      project: PROJECT,
      token: TOKEN
    })
    expect(consumer.onIncomingCall).toBeUndefined()
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

  it('should set onTask handler', () => {
    const consumer = setupConsumer({
      project: PROJECT,
      token: TOKEN,
      onTask: noOp
    })
    expect(consumer.onTask).toBeInstanceOf(Function)
  })
})
