import log from 'loglevel'

const datetime = () => new Date().toISOString().replace('T', ' ').replace('Z', '')
const logger = log.getLogger('signalwire')

const originalFactory = logger.methodFactory
logger.methodFactory = (methodName, logLevel, loggerName) => {
  const rawMethod = originalFactory(methodName, logLevel, loggerName)
  // tslint:disable-next-line
  return function () {

    const messages = [datetime(), ' : ']

    {
        let err = new Error()
    
        if (err) {
            let stack = err.stack
            if (stack) {
                let stacksp = stack.split("at ")
                if (stacksp.length > 2) {
                    let logLineDetails = stacksp[2].trim()
                    messages.push(logLineDetails)
                }
            }
        }
    }

    messages.push('\n')

    for (let i = 0; i < arguments.length; i++) {
      messages.push(arguments[i])
    }
    rawMethod.apply(undefined, messages)
  }
}
logger.setLevel(logger.getLevel())

export default logger
