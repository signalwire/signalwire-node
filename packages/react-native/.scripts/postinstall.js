const execa = require('execa')
const Listr = require('listr')

function cwd() {
  return process.env.INIT_CWD
}

async function main() {
  const mainTasks = [
    {
      title: 'Installing WebRTC engine..',
      task: async () => {
        await execa('npm', [ 'install', 'react-native-get-random-values' ], { cwd: cwd() })
        await execa('npm', [ 'install', 'react-native-webrtc' ], { cwd: cwd() })
      },
    },
    {
      title: 'Installing InCall Manager..',
      task: async () => {
        await execa('npm', [ 'install', 'react-native-incall-manager' ], { cwd: cwd() })
      },
    },
  ]

  await new Listr(mainTasks, { showSubtasks: true }).run().catch(e => console.error(e.message))
}

const { INIT_CWD, PWD } = process.env
if (INIT_CWD === PWD || (INIT_CWD && INIT_CWD.indexOf(PWD) === 0)) {
  console.log('\tSkip on dev..')
} else {
  main()
}
