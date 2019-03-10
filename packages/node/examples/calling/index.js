require('dotenv').config()
const inquirer = require('inquirer')
const SignalWire = require('../..')

const host = process.env.SIGNALWIRE_API_HOSTNAME
const project = process.env.SIGNALWIRE_API_PROJECT
const token = process.env.SIGNALWIRE_API_TOKEN
const FROM_NUMBER = process.env.DEFAULT_FROM_NUMBER

console.log('Init client with: ', host, project, token, '\n')
const client = new SignalWire.RelayClient({ host, project, token })

const _gracefulExit = () => {
  client.disconnect()
  console.log('\nHope to see you again!\n')
}

client.on('signalwire.error', error => {
  console.error('SW Client error,', error)
})

client.on('signalwire.ready', session => {
  console.log('SW Client ready! \n')

  // process.on('SIGINT', _gracefulExit)
  process.on('exit', _gracefulExit)

  _init()
})

client.connect()

async function makeCall(to) {
  const leg = await client.calling.makeCall({ type: 'phone', from: FROM_NUMBER, to })
    .catch(error => {
      console.error('MakeCall error:', error)
    })
  if (!leg) {
    return
  }
  leg.on('created', call => {
    console.log(`\t ${call.id} state from ${call.prevState} to ${call.state}`, '\n')
  })
  .on('ringing', call => {
    console.log(`\t ${call.id} state from ${call.prevState} to ${call.state}`, '\n')
  })
  .on('answered', call => {
    console.log(`\t ${call.id} state from ${call.prevState} to ${call.state}`, '\n')
  })
  .on('ending', call => {
    console.log(`\t ${call.id} state from ${call.prevState} to ${call.state}`, '\n')
  })
  .on('ended', call => {
    console.log(`\t ${call.id} state from ${call.prevState} to ${call.state}`, '\n')
    _init()
  })

  leg.on('disconnected', call => {
    console.log(`\t ${call.id} has been disconnected!`, '\n')
  })
  .on('connecting', call => {
    console.log(`\t ${call.id} trying to connecting..`, '\n')
  })
  .on('connected', call => {
    console.log(`\t ${call.id} has been connected with ${call.peer.id}!`, '\n')
  })
  .on('failed', call => {
    console.log(`\t ${call.id} failed to connect!`, '\n')
  })

  return leg
}

const sleep = (seconds) => {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}

function _init() {
  const choices = [
    'Test a single call',
    'Make a call and then "call.connect"',
    'Make a call and play TTS',
    'Register a listener for inbound calls',
    { name: 'Send a message', disabled: 'not ready yet :) ' },
    'Just Exit'
  ]
  const exitChoice = choices[choices.length - 1]
  const questions = [
    {
      type: 'list',
      name: 'choice',
      message: 'What do you want to do?',
      choices: choices
    },
    {
      type: 'input',
      name: 'to_number',
      message: 'Enter the number to call:',
      when: ({ choice }) => choice === choices[0] || choice === choices[1] || choice === choices[2],
      default: () => '+12029195378'
    },
    {
      type: 'input',
      name: 'connect_to_number',
      message: 'Enter the number to connect the answered call:',
      when: ({ choice }) => choice === choices[1],
      default: () => '+12044000543'
    },
    {
      type: 'input',
      name: 'tts_to_play',
      message: 'Enter TTS to play:',
      when: ({ choice }) => choice === choices[2],
      default: () => 'Hey There, Welcome at SignalWire!'
    },
    {
      type: 'input',
      name: 'context',
      message: 'Context to listen on:',
      when: ({ choice }) => choice === choices[3]
    }
  ]
  inquirer.prompt(questions).then(async answers => {
    if (answers.choice === exitChoice) {
      return process.exit()
    }
    if (!answers.to_number && !answers.context) {
      return _init()
    }

    if (answers.to_number) {
      const call = await makeCall(answers.to_number)

      // call.on('answered', async call => {
      //   setTimeout(() => {
      //     call.hangup().catch(console.error)
      //   }, 3000)
      // })

      if (answers.connect_to_number) {
        call.on('answered', async call => {
          const response = await call.connect({ type: 'phone', to: answers.connect_to_number })
            .catch(error => {
              console.error('\tCall connect failed to start', error)
            })
          if (response) {
            console.log(`\tCall connect response:`, response)
          }
        })
      }

      if (answers.tts_to_play) {
        call.on('answered', call => {
          call.playTTS({ text: answers.tts_to_play} ).then(() => {
            console.log(`\t TTS received?`)
          })
        })
      }
      console.warn(`\tCall to ${answers.to_number} starts now!\n`)
      call.begin()
        .catch(error => {
          console.error('Call cant start:', error)
          _init()
        })

    } else if (answers.context) {
      try {
        await client.calling.onInbound(answers.context, async call => {
          console.warn(`Inbound call on "${call.context}"`, `from: ${call.from} - to: ${call.to}`)
          await sleep(4)
          await call.answer().catch(console.error)
          // await sleep(5)
          // await call.hangup().catch(console.error)
        })
        console.log(`Listener for ${answers.context} started..\n`)
      } catch (error) {
        console.error('onInbound error:', error)
      } finally {
        _init()
      }
    }
  })
}
