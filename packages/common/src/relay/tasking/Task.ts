import { request } from 'https'

export default class Task {

  public host: string = 'relay.signalwire.com'

  constructor(public project: string, public token: string) {}

  deliver(context: string, message: any) {
    const data = JSON.stringify({ context, message })
    const options = {
      host: this.host,
      port: 443,
      path: '/api/relay/private/tasks',
      headers: {
        'Authorization': 'Basic ' + new Buffer(`${this.project}:${this.token}`).toString('base64'),
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    const req = request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`)
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        console.log('chunks', chunks.length)
        const body = Buffer.concat(chunks).toString()
        console.log('body:', JSON.parse(JSON.parse(body).data))
      })
    })

    req.on('error', (error) => {
      console.error(error)
    })

    req.write(data)
    req.end()
  }
}
