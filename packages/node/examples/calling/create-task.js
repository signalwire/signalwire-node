const { Task } = require('../..')

const yourTask = new Task(process.env.PROJECT, process.env.TOKEN)
const context = 'office'
yourTask.deliver(context, { key: 'value', data: 'random stuff' })
  .then(() => {
    console.log('Task created successfully!')
  })
  .catch((error) => {
    console.log('Error creating task!', error)
  })
