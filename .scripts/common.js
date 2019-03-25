const fs = require('fs-extra')
const path = require('path')
const execa = require('execa')
const Listr = require('listr')
// const semver = require('semver')
// const tc = require('turbocolor')

const rootDir = path.join(__dirname, '../')

const packages = [ 'common', 'node', 'web', 'react-native' ]

function readPkg(project) {
  const packageJsonPath = packagePath(project)
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
}

function writePkg(project, pkg) {
  const packageJsonPath = packagePath(project)
  const text = JSON.stringify(pkg, null, 2)
  return fs.writeFileSync(packageJsonPath, `${text}\n`)
}

function packagePath(project) {
  return path.join(projectPath(project), 'package.json')
}

function projectPath(project) {
  return path.join(rootDir, 'packages', project)
}

function updateDependency(pkg, dependency, version) {
  if (pkg.dependencies && pkg.dependencies[dependency]) {
    pkg.dependencies[dependency] = version
  }
  if (pkg.devDependencies && pkg.devDependencies[dependency]) {
    pkg.devDependencies[dependency] = version
  }
}

function setupPackage(tasks, package) {
  const projectRoot = projectPath(package)
  const pkg = readPkg(package)

  const projectTasks = []
  if (package === 'common') {
    projectTasks.push({
      title: `install npm deps for common lib..`,
      task: async () => {
        await fs.remove(path.join(projectRoot, 'node_modules'))
        await execa('npm', ['i'], { cwd: projectRoot })
      }
    })
  } else {
    projectTasks.push({
      title: `install npm deps, lint source code, run tests and make a clean build...`,
      task: async () => {
        await fs.remove(path.join(projectRoot, 'node_modules'))
        await execa('npm', ['run', 'validate'], { cwd: projectRoot })
      }
    })
  }

  tasks.push({
    title: `Setup ${pkg.name}`,
    task: () => new Listr(projectTasks)
  })
}

module.exports = {
  rootDir,
  packages,
  readPkg,
  writePkg,
  packagePath,
  projectPath,
  updateDependency,
  setupPackage,
}
