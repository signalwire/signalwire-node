const execa = require('execa')
const Listr = require('listr')

function cwd() {
    return process.env.INIT_CWD
}

async function main() {
    const mainTasks = [
        {
            title: 'Checking react-native..',
            task: async () =>
                await execa('react-native', [ '--version' ], { cwd: cwd() }).catch((error) => {
                    throw new Error('\n\n\treact-native CLI not available.\n\n')
                }),
        },
        {
            title: 'Installing WebRTC engine..',
            task: async () => {
                await execa('npm', [ 'install', 'react-native-webrtc' ], { cwd: cwd() })
            },
        },
        {
            title: 'Installing InCall Manager..',
            task: async () => {
                await execa('npm', [ 'install', 'react-native-incall-manager' ], { cwd: cwd() })
            },
        },
        {
            title: 'Installing AsyncStorage..',
            task: async () => {
                await execa('npm', [ 'install', '@react-native-community/async-storage' ], { cwd: cwd() })
            },
        },
    ]

    await new Listr(mainTasks, { showSubtasks: true }).run().catch((e) => console.error(e.message))
}

const { INIT_CWD, PWD } = process.env
if (INIT_CWD === PWD || (INIT_CWD && INIT_CWD.indexOf(PWD) === 0)) {
    console.log('\tSkip on dev..')
} else {
    main()
}
