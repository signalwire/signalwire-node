const https = require('https')

const data = JSON.stringify({
  test: 'task'
})

const options = {
  hostname: 'httpbin.org',
  port: 443,
  path: '/delay/2',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`)
  const chunks = []
  res.on('data', chunk => chunks.push(chunk))
  res.on('end', () => {
    console.log('chunks', chunks.length)
    const body = Buffer.concat(chunks)
    console.log('body:', JSON.parse(JSON.parse(body).data))
  })
})

req.on('error', (error) => {
  console.error(error)
})

req.write(data)
req.end()
