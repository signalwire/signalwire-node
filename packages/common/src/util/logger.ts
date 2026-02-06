import log from 'loglevel'

interface LogMessage {
  level: string
  timestamp: string
  messages: any[]
}

const datetime = () =>
  new Date().toISOString().replace('T', ' ').replace('Z', '')
const logger = log.getLogger('signalwire') as log.Logger & {
  flush: (level?: string) => LogMessage[]
}

const messageCache: LogMessage[] = []

const originalFactory = logger.methodFactory
logger.methodFactory = (methodName, logLevel, loggerName) => {
  const rawMethod = originalFactory(methodName, logLevel, loggerName)
  // tslint:disable-next-line
  return function () {
    const timestamp = datetime()
    const messages = [timestamp, '-']
    const logArgs = []
    for (let i = 0; i < arguments.length; i++) {
      messages.push(arguments[i])
      logArgs.push(arguments[i])
    }

    messageCache.push({
      level: methodName,
      timestamp,
      messages: logArgs,
    })

    rawMethod.apply(undefined, messages)
  }
}

logger.flush = function (level?: string): LogMessage[] {
  if (!level) {
    const allMessages = [...messageCache]
    messageCache.splice(0)
    return allMessages
  }

  const matchingMessages: LogMessage[] = []

  for (const message of messageCache) {
    if (message.level === level.toLowerCase()) {
      matchingMessages.push(message)
    }
  }

  messageCache.splice(0)

  return matchingMessages
}

logger.setLevel(logger.getLevel())

export default logger
