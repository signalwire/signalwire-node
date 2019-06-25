import RestClient from '../../src/rest'

const host = 'example.signalwire.com'
const project = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'
const token = 'PTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'

export default RestClient(project, token, { signalwireSpaceUrl: host })
