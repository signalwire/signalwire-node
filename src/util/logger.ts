declare var ENV: string

const _do = (type: string, args: any) => {
  if (ENV === 'development') {
    console[type](...args)
  }
}

const logger = {
  info: (...args) => {
    _do('info', args)
  },
  warn: (...args) => {
    _do('warn', args)
  },
  error: (...args) => {
    _do('error', args)
  },
  debug: (...args) => {
    _do('debug', args)
  }
}

export default logger