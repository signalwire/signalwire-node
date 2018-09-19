import winston from 'winston'

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      name: 'debug-console',
      level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
      prettyPrint: true,
      handleExceptions: true,
      // json: false,
      colorize: true
    })
  ],
  exitOnError: false
});

export default logger;