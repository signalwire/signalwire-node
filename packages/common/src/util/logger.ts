import log from 'loglevel'

const datetime = () => new Date().toISOString()
const logger = log.getLogger('cantina')

const originalFactory = logger.methodFactory
logger.methodFactory = (methodName, logLevel, loggerName) => {
  const rawMethod = originalFactory(methodName, logLevel, loggerName)

  // tslint:disable-next-line
  return function (...args: any[]) {
    args.unshift(datetime(), '-')
    rawMethod.apply(undefined, args)
  }
}
logger.setLevel(logger.getLevel())

export default logger
