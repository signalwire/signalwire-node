/// This file shows how to send a Task to a Consumer on the "office" context.
///
/// See the related handle-tasks.js file to see how to handle your Task
/// within the Consumer!

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
