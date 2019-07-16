const nock = require('nock')
import Task from '../../../common/src/relay/tasking/Task'

describe('RestClient', () => {
  const path = '/api/relay/rest/tasks'
  const user = 'project'
  const pass = 'token'
  const _setupNock = () => nock('https://relay.signalwire.com').post(path).basicAuth({ user, pass })

  it('should create a call', async () => {
    _setupNock().reply(204)
    expect.assertions(1)
    const task = new Task(user, pass)
    await expect(task.deliver('context', { random: 'data' })).resolves.toBeUndefined()
  })

  it('should create a call', async () => {
    _setupNock().reply(401)
    expect.assertions(1)
    const task = new Task(user, pass)
    await expect(task.deliver('context', { random: 'data' })).rejects.toBeUndefined()
  })
})
