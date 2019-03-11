import * as log from 'loglevel'
const datetime = () => new Date().toISOString().replace('T', ' ').replace('Z', '')
const logger = log.getLogger('signalwire')
// logger.setLevel(log.levels.WARN, true)
// logger.enableAll()

const originalFactory = logger.methodFactory
logger.methodFactory = (methodName, logLevel, loggerName) => {
  const rawMethod = originalFactory(methodName, logLevel, loggerName)
  return function () {
    const messages = [datetime(), '-']
    for (let i = 0; i < arguments.length; i++) {
      messages.push(arguments[i])
    }
    rawMethod.apply(undefined, messages)
  }
}
logger.setLevel(logger.getLevel())

export default logger
