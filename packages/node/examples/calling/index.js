require('dotenv').config()
const inquirer = require('inquirer')
const SignalWire = require('../..')

const _inspect = () => {
  const { _callingInstance } = client
  if (_callingInstance) {
    console.log('Calls:', _callingInstance._calls.length, _callingInstance._calls)
  }
  console.log('\n')
}

const host = 'your-space.signalwire.com'
const project = ''
const token = ''
const FROM_NUMBER = '+1899000XXXX'

if (!project || !token) {
  throw new Error('Set your SignalWire project and token before run the example.')
}

console.log('Init client with: ', host, project, token, '\n')
const client = new SignalWire.RelayClient({ host, project, token })

const _gracefulExit = () => {
  client.disconnect()
  console.log('\nHope to see you again!\n')
}

client.on('signalwire.error', error => {
  console.error('SW Client error,', error)
}).on('signalwire.ready', session => {
  console.log('SW Client ready! \n')

  process.on('SIGINT', _gracefulExit)
  process.on('exit', _gracefulExit)

  _init()
})

// client.__logger.setLevel(1)
client.connect()

async function createCall(to) {
  const leg = await client.calling.newCall({ type: 'phone', from: FROM_NUMBER, to })
    .catch(error => {
      console.error('createCall error:', error)
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

  leg.on('record.recording', params => {
    console.log(`\t Record state changed for ${params.call_id} in ${params.state} - ${params.control_id}`)
  })
  leg.on('record.paused', params => {
    console.log(`\t Record state changed for ${params.call_id} in ${params.state} - ${params.control_id}`)
  })
  leg.on('record.finished', params => {
    console.log(`\t Record state changed for ${params.call_id} in ${params.state} - ${params.control_id}`)
  })
  leg.on('record.no_input', params => {
    console.log(`\t Record state changed for ${params.call_id} in ${params.state} - ${params.control_id}`)
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
    'Inspect Client',
    'Change logLevel',
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
    },
    {
      type: 'list',
      name: 'logLevel',
      message: 'Log level to use:',
      when: ({ choice }) => choice === choices[6],
      choices: Object.keys(client.__logger.levels)
    }
  ]
  inquirer.prompt(questions).then(async answers => {
    if (answers.choice === exitChoice) {
      return process.exit()
    }
    if (answers.choice === choices[5]) {
      _inspect()
      return _init()
    }
    if (answers.choice === choices[6] && answers.logLevel) {
      client.__logger.setLevel(answers.logLevel)
      return _init()
    }
    if (!answers.to_number && !answers.context) {
      return _init()
    }

    if (answers.to_number) {
      const call = await createCall(answers.to_number)

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

      if (true) { // TODO:
        call.on('answered', call => {
          const recordOpts = {
            beep: false,
            format: 'mp3',
            stereo: false,
            direction: 'both',
            // initial_timeout: 0.0,
            // end_silence_timeout: 0.0,
            // terminators: ''
          }
          call.startRecord(recordOpts)
            .then(response => {
              console.log(`\t Record Success!`, response)
            })
            .catch(error => {
              console.error(`\t Record failed?`, error)
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
          console.warn(`\tInbound call on "${call.context}"`, `from: ${call.from} - to: ${call.to}\n`)
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
