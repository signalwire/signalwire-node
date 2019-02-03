process.env.SIGNALWIRE_API_HOSTNAME = 'example.signalwire.com'
process.env.SIGNALWIRE_API_PROJECT = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'
process.env.SIGNALWIRE_API_TOKEN = 'PTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'

const RestClient = require('..').RestClient

export default new RestClient(process.env.SIGNALWIRE_API_PROJECT, process.env.SIGNALWIRE_API_TOKEN)
