const path = require('path')
const { exec } = require('child_process')

// "index.ts" within each package set the version for the UserAgent string.
// the VERSION in index.ts must be equal to the version in package.json.
// This step could be solved by reading the version from package.json but it's not possible for ESM/transpiled target.
const packagePath = path.join(process.cwd(), 'package.json')
const { version } = require(packagePath)
exec(`grep "VERSION = '${version}'$" index.ts`, err => {
  if (err) {
    console.error("Package versions in 'package.json' and 'index.ts' mismatch.\n")
    process.exit(1)
  }
})
