// import winston from 'winston'

// const logger = new winston.Logger({
//   transports: [
//     new winston.transports.Console({
//       name: 'debug-console',
//       level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
//       prettyPrint: true,
//       handleExceptions: true,
//       // json: false,
//       colorize: true
//     })
//   ],
//   exitOnError: false
// });

// export default logger;
// declare var ENV: string

const datetime = () => new Date().toISOString().replace('T', ' ').replace('Z', '')
const _do = (type: string, args: any) => {
  console[type](datetime(), '::', ...args)
}

const logger = {
  info: (...args) => {
    process.env.NODE_ENV === 'development' ? _do('info', args) : null
  },
  debug: (...args) => {
    process.env.NODE_ENV === 'development' ? _do('debug', args) : null
  },
  warn: (...args) => {
    _do('warn', args)
  },
  error: (...args) => {
    _do('error', args)
  }
}

export default logger
