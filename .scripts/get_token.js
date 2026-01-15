#!/usr/bin/env node

/**
 * SignalWire JWT Token Generator CLI
 *
 * Generates JWT tokens for SignalWire Browser SDK authentication.
 * See: https://developer.signalwire.com/sdks/browser-sdk/v2/#authentication-using-jwt
 *
 * Usage:
 *   node get_token.js --space <space> --project <project_id> --token <project_token> [options]
 *
 * Environment variables (alternative to CLI args):
 *   SIGNALWIRE_SPACE     - Your SignalWire space (e.g., "example" for example.signalwire.com)
 *   SIGNALWIRE_PROJECT   - Your Project ID
 *   SIGNALWIRE_TOKEN     - Your Project Token
 *
 * Supports .env files - create a .env file in the project root or current directory.
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env file
function loadEnvFile() {
  // Check multiple locations for .env file
  const locations = [
    path.join(process.cwd(), '.env'),
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '.env'),
  ]

  for (const envPath of locations) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8')
        const lines = content.split('\n')

        for (const line of lines) {
          // Skip empty lines and comments
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith('#')) continue

          // Parse KEY=value format
          const match = trimmed.match(/^([^=]+)=(.*)$/)
          if (match) {
            const key = match[1].trim()
            let value = match[2].trim()

            // Remove surrounding quotes if present
            if (
              (value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))
            ) {
              value = value.slice(1, -1)
            }

            // Only set if not already defined (CLI/system env takes precedence)
            if (!(key in process.env)) {
              process.env[key] = value
            }
          }
        }

        console.log(`Loaded environment from: ${envPath}`)
        return true
      } catch (err) {
        console.warn(`Warning: Could not read ${envPath}: ${err.message}`)
      }
    }
  }

  return false
}

// Load .env file before parsing args
loadEnvFile()

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2)
  const parsed = {
    space: process.env.SIGNALWIRE_SPACE,
    project: process.env.SIGNALWIRE_PROJECT,
    token: process.env.SIGNALWIRE_TOKEN,
    resource: undefined,
    expiresIn: undefined,
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--space':
      case '-s':
        parsed.space = args[++i]
        break
      case '--project':
      case '-p':
        parsed.project = args[++i]
        break
      case '--token':
      case '-t':
        parsed.token = args[++i]
        break
      case '--resource':
      case '-r':
        parsed.resource = args[++i] || process.env.SIGNALWIRE_REFERENCE
        break
      case '--expires-in':
      case '-e':
        parsed.expiresIn = parseInt(args[++i], 10)
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
      default:
        if (args[i].startsWith('-')) {
          console.error(`Unknown option: ${args[i]}`)
          process.exit(1)
        }
    }
  }

  return parsed
}

function printHelp() {
  console.log(`
SignalWire JWT Token Generator

Usage:
  node get_token.js [options]

Options:
  -s, --space <space>       SignalWire space name (e.g., "example" for example.signalwire.com)
  -p, --project <id>        Project ID
  -t, --token <token>       Project Token (API token)
  -r, --resource <name>     Resource name for the endpoint (default: random UUID)
  -e, --expires-in <mins>   Token expiration in minutes (default: 15)
  -h, --help                Show this help message

Environment Variables:
  SIGNALWIRE_SPACE          Alternative to --space
  SIGNALWIRE_PROJECT        Alternative to --project
  SIGNALWIRE_TOKEN          Alternative to --token

.env File Support:
  The script automatically loads .env files from:
    1. Current working directory (.env)
    2. Project root (../.env from script location)
    3. Script directory (.scripts/.env)

  Example .env file:
    SIGNALWIRE_SPACE=your-space
    SIGNALWIRE_PROJECT=your-project-id
    SIGNALWIRE_TOKEN=your-api-token

Examples:
  # Using CLI arguments
  node get_token.js -s example -p your-project-id -t your-token

  # Using environment variables
  export SIGNALWIRE_SPACE=example
  export SIGNALWIRE_PROJECT=your-project-id
  export SIGNALWIRE_TOKEN=your-token
  node get_token.js

  # With custom resource and expiration
  node get_token.js -s example -p proj-id -t token -r alice -e 60
`)
}

function validateArgs(args) {
  const missing = []
  if (!args.space) missing.push('space (--space or SIGNALWIRE_SPACE)')
  if (!args.project) missing.push('project (--project or SIGNALWIRE_PROJECT)')
  if (!args.token) missing.push('token (--token or SIGNALWIRE_TOKEN)')

  if (missing.length > 0) {
    console.error('Error: Missing required parameters:')
    missing.forEach((m) => console.error(`  - ${m}`))
    console.error('\nUse --help for usage information.')
    process.exit(1)
  }
}

function getJwtToken(args) {
  return new Promise((resolve, reject) => {
    // Build request body
    const body = {}
    if (args.resource) body.resource = args.resource
    if (args.expiresIn) body.expires_in = args.expiresIn

    const bodyStr = JSON.stringify(body)

    // Normalize space (remove .signalwire.com if included)
    const space = args.space.replace(/\.signalwire\.com$/i, '')

    const options = {
      hostname: `${space}.signalwire.com`,
      port: 443,
      path: '/api/relay/rest/jwt',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        Authorization:
          'Basic ' +
          Buffer.from(`${args.project}:${args.token}`).toString('base64'),
      },
    }

    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(data)
            resolve(json)
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`))
          }
        } else {
          reject(
            new Error(`HTTP ${res.statusCode}: ${res.statusMessage}\n${data}`),
          )
        }
      })
    })

    req.on('error', (e) => {
      reject(new Error(`Request failed: ${e.message}`))
    })

    req.write(bodyStr)
    req.end()
  })
}

async function main() {
  const args = parseArgs()
  validateArgs(args)

  console.log(`Requesting JWT token from ${args.space}.signalwire.com...`)
  if (args.resource) console.log(`  Resource: ${args.resource}`)
  if (args.expiresIn) console.log(`  Expires in: ${args.expiresIn} minutes`)

  try {
    const result = await getJwtToken(args)

    console.log('\n--- JWT Token (use this in the client) ---')
    console.log(result.jwt_token)

    if (result.refresh_token) {
      console.log('\n--- Refresh Token (keep this secret, use server-side) ---')
      console.log(result.refresh_token)
    }

    console.log('\n--- Full Response ---')
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    console.error(`\nError: ${error.message}`)
    process.exit(1)
  }
}

main()
