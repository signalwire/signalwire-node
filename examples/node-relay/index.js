require('dotenv').config()
const inquirer = require('inquirer')
const sw = require('signalwire-client-js')

const host = process.env.SIGNALWIRE_API_HOSTNAME
const project = process.env.SIGNALWIRE_API_PROJECT
const token = process.env.SIGNALWIRE_API_TOKEN

const FROM_NUMBER = '2029195378'

console.log('Init client with: ', host, project, token, '\n')
const client = new sw.SignalWire({ host, project, token })

client.on('signalwire.error', error => {
  console.error('SW Client error,', error)
})

client.on('signalwire.ready', session => {
  console.log('SW Client ready! \n')
  _init()
})

client.connect()

async function makeCall(to) {
  const leg = await client.calling.makeCall(FROM_NUMBER, to)
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
  // .begin()

  return leg
}

function _init() {
  const choices = [
    'Test a single call',
    'Make a call and then "call.connect"',
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
      when: answers => answers.choice !== exitChoice,
      default: () => '2083660792'
    },
    {
      type: 'input',
      name: 'connect_to_number',
      message: 'Enter the number to connect the answered call:',
      when: answers => answers.choice === choices[1],
      default: () => '2083660792'
    }
  ]
  inquirer.prompt(questions).then(async answers => {
    if (answers.choice === exitChoice) {
      return process.exit()
    }
    if (!answers.to_number) {
      console.warn('Please, enter the number to call!\n')
      return _init()
    }
    const call = await makeCall(answers.to_number)
    if (answers.connect_to_number) {
      call.on('answered', call => {
        call.connect(answers.connect_to_number).then(() => {
          console.log(`\tCall connected?`)
        })
      })
    }

    console.warn(`\tCall to ${answers.to_number} starts now!\n`)
    call.begin()
  })
}
