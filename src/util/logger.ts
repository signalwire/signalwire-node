declare var ENV: string

const _do = (type: string, args: any) => {
  console[type](...args)
}

const logger = {
  info: (...args) => {
    ENV === 'development' ? _do('info', args) : null
  },
  debug: (...args) => {
    ENV === 'development' ? _do('debug', args) : null
  },
  warn: (...args) => {
    _do('warn', args)
  },
  error: (...args) => {
    _do('error', args)
  }
}

export default logger
