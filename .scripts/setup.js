const common = require('./common')
const Listr = require('listr')


async function main() {
  const tasks = []
  const input = process.argv[2]
  common.packages
    .filter(package => package === 'common' || (!input || input === package))
    .forEach(package => common.setupPackage(tasks, package))
  await new Listr(tasks, { showSubtasks: true }).run()
}

main().catch(error => process.exit(1))
