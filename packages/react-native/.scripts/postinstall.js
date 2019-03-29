const execa = require('execa')
// const path = require('path')
const Listr = require('listr')

function cwd() {
  return process.env.INIT_CWD
}

async function main() {
  const mainTasks = [
    {
      title: 'Checking react-native..',
      task: async () => await execa('react-native', ['--version'], { cwd: cwd() }).catch(error => {
        throw new Error('\n\n\treact-native CLI not available.\n\n')
      })
    },
    {
      title: 'Installing WebRTC engine..',
      task: async () => await execa('npm', ['install', 'react-native-webrtc'], { cwd: cwd() })
    },
    {
      title: 'Linking native libraries...\n',
      task: () => new Listr([ androidTasks(), iosTasks() ])
    }
  ]

  await new Listr(mainTasks, { showSubtasks: true }).run().catch(e => console.error(e.message))
}

function androidTasks() {
  const tasks = [
    {
      title: `Link WebRTC engine to Android..`,
      task: async () => await execa('react-native', ['link', 'react-native-webrtc', 'android'], { cwd: cwd() })
    }
  ]

  return {
    title: 'Checking Android...',
    task: () => new Listr(tasks)
  }
}

function iosTasks() {
  // TODO: check Podfile for iOS
  const tasks = [
    {
      title: `Link WebRTC engine to iOS..`,
      task: async () => await execa('react-native', ['link', 'react-native-webrtc', 'ios'], { cwd: cwd() })
    }
  ]

  return {
    title: 'Checking iOS...',
    task: () => new Listr(tasks)
  }
}

const { INIT_CWD, PWD } = process.env
if (INIT_CWD === PWD || INIT_CWD.indexOf(PWD) === 0) {
  console.log('\tSkip on dev..')
} else {
  main()
}
