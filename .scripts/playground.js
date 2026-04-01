#!/usr/bin/env node

/**
 * SignalWire Playground Script
 *
 * Fetches a JWT token and serves the vanilla-calling example using Python's http.server.
 *
 * Usage:
 *   node playground.js [options]
 *
 * Environment variables (or use .env file):
 *   SIGNALWIRE_SPACE     - Your SignalWire space
 *   SIGNALWIRE_PROJECT   - Your Project ID
 *   SIGNALWIRE_TOKEN     - Your Project Token
 */

const { spawn, execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const EXAMPLE_DIR = path.join(
  __dirname,
  '..',
  'packages',
  'js',
  'examples',
  'vanilla-calling'
)
const TOKEN_SCRIPT = path.join(__dirname, 'get_token.js')
const DEFAULT_PORT = 9898

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2)
  const parsed = {
    port: DEFAULT_PORT,
    resource: undefined,
    expiresIn: undefined,
    help: false,
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--port':
      case '-P':
        parsed.port = parseInt(args[++i], 10)
        break
      case '--resource':
      case '-r':
        parsed.resource = args[++i]
        break
      case '--expires-in':
      case '-e':
        parsed.expiresIn = args[++i]
        break
      case '--help':
      case '-h':
        parsed.help = true
        break
    }
  }

  return parsed
}

function printHelp() {
  console.log(`
SignalWire Playground

Fetches a JWT token and serves the vanilla-calling example.

Usage:
  node playground.js [options]

Options:
  -P, --port <port>         HTTP server port (default: ${DEFAULT_PORT})
  -r, --resource <name>     Resource name for the token
  -e, --expires-in <mins>   Token expiration in minutes
  -h, --help                Show this help message

Environment Variables (or use .env file):
  SIGNALWIRE_SPACE          Your SignalWire space
  SIGNALWIRE_PROJECT        Your Project ID
  SIGNALWIRE_TOKEN          Your Project Token

The script will:
  1. Fetch a JWT token using get_token.js
  2. Display the token and project ID for easy copy/paste
  3. Start a Python HTTP server serving the vanilla-calling example
  4. Open http://localhost:${DEFAULT_PORT} in your browser

Example:
  # Basic usage (uses .env file)
  node playground.js

  # Custom port and resource
  node playground.js -P 8080 -r alice
`)
}

function getToken(args) {
  return new Promise((resolve, reject) => {
    const tokenArgs = []
    if (args.resource) tokenArgs.push('-r', args.resource)
    if (args.expiresIn) tokenArgs.push('-e', args.expiresIn)

    const proc = spawn('node', [TOKEN_SCRIPT, ...tokenArgs], {
      stdio: ['inherit', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    proc.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Token script failed:\n${stderr || stdout}`))
        return
      }

      // Parse the JSON response from the output
      const jsonMatch = stdout.match(/--- Full Response ---\s*([\s\S]+)$/)
      if (jsonMatch) {
        try {
          const json = JSON.parse(jsonMatch[1].trim())
          resolve(json)
        } catch (e) {
          reject(new Error(`Failed to parse token response: ${e.message}`))
        }
      } else {
        reject(new Error('Could not find token in output'))
      }
    })
  })
}

function checkPython() {
  try {
    execSync('python3 --version', { stdio: 'pipe' })
    return 'python3'
  } catch {
    try {
      execSync('python --version', { stdio: 'pipe' })
      return 'python'
    } catch {
      return null
    }
  }
}

function startServer(pythonCmd, port) {
  console.log(`\nStarting HTTP server on port ${port}...`)
  console.log(`Serving: ${EXAMPLE_DIR}`)

  const server = spawn(pythonCmd, ['-m', 'http.server', port.toString()], {
    cwd: EXAMPLE_DIR,
    stdio: 'inherit',
  })

  server.on('error', (err) => {
    console.error(`Failed to start server: ${err.message}`)
    process.exit(1)
  })

  return server
}

function openBrowser(url) {
  const platform = process.platform
  let cmd

  switch (platform) {
    case 'darwin':
      cmd = 'open'
      break
    case 'win32':
      cmd = 'start'
      break
    default:
      cmd = 'xdg-open'
  }

  try {
    spawn(cmd, [url], { stdio: 'ignore', detached: true }).unref()
  } catch {
    // Silently fail if we can't open the browser
  }
}

async function main() {
  const args = parseArgs()

  if (args.help) {
    printHelp()
    process.exit(0)
  }

  // Check if example directory exists
  if (!fs.existsSync(EXAMPLE_DIR)) {
    console.error(`Error: Example directory not found: ${EXAMPLE_DIR}`)
    process.exit(1)
  }

  // Check for Python
  const pythonCmd = checkPython()
  if (!pythonCmd) {
    console.error('Error: Python is required but not found in PATH')
    console.error('Please install Python 3 and try again')
    process.exit(1)
  }

  console.log('='.repeat(60))
  console.log('SignalWire Playground')
  console.log('='.repeat(60))

  // Fetch token
  console.log('\nFetching JWT token...')
  let tokenData
  try {
    tokenData = await getToken(args)
  } catch (err) {
    console.error(`\nError: ${err.message}`)
    process.exit(1)
  }

  // Load env to get project ID
  // Re-run the env loading logic to get SIGNALWIRE_PROJECT
  const envLocations = [
    path.join(process.cwd(), '.env'),
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '.env'),
  ]

  let projectId = process.env.SIGNALWIRE_PROJECT
  if (!projectId) {
    for (const envPath of envLocations) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8')
        const match = content.match(/SIGNALWIRE_PROJECT=(.+)/)
        if (match) {
          projectId = match[1].trim().replace(/^["']|["']$/g, '')
          break
        }
      }
    }
  }

  // Display credentials
  console.log('\n' + '='.repeat(60))
  console.log('CREDENTIALS (copy these to the web UI)')
  console.log('='.repeat(60))
  console.log(`\nProject ID: ${projectId || 'N/A'}`)
  console.log(`\nJWT Token:\n${tokenData.jwt_token}`)
  console.log('\n' + '='.repeat(60))

  // Start server
  const url = `http://localhost:${args.port}`
  const server = startServer(pythonCmd, args.port)

  console.log(`\nOpen your browser at: ${url}`)
  console.log('Press Ctrl+C to stop the server\n')

  // Give server a moment to start, then open browser
  setTimeout(() => {
    openBrowser(url)
  }, 1000)

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\nShutting down server...')
    server.kill()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    server.kill()
    process.exit(0)
  })
}

main()
