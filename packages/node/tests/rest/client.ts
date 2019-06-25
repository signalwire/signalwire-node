import RestClient from '../../src/rest'

const host = 'example.signalwire.com'
const project = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'
const token = 'PTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'

const client = RestClient(project, token, { signalwireSpaceUrl: host })
export default client
