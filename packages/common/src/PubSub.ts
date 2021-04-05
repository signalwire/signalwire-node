export class EventPubSub {

  private _queue: { [key: string]: Function[] } = {}
  private _uniqueKey = Symbol.for('sw-once-key')

  on(eventName: string, handler: Function, once = false) {
    if (!this._queue[eventName]) {
      this._queue[eventName] = []
    }
    this._queue[eventName].push(handler)
    handler[this._uniqueKey] = once
    return this
  }

  once(eventName: string, handler: Function) {
    return this.on(eventName, handler, true)
  }

  off(eventName: string, handler: Function = null) {
    if (!this._queue[eventName]) {
      return this
    }

    if (!handler) {
      delete this._queue[eventName]
      return this
    }

    const handlers = this._queue[eventName]
    while (handlers.includes(handler)) {
      handlers.splice(handlers.indexOf( handler ), 1)
    }
    if (!handlers.length) {
      delete this._queue[eventName]
    }
    return this
  }

  emit(eventName: string, ...args: any[]) {
    if (!this._queue[eventName]) {
      return this
    }
    const handlers = this._queue[eventName]
    const deleteOnceHandled = []
    for (let handler of handlers) {
      handler(...args)
      if (handler[this._uniqueKey]) {
        deleteOnceHandled.push(handler)
      }
    }
    for(let handler of deleteOnceHandled){
      this.off(eventName, handler)
    }
    return this
  }

  reset() {
    for(let eventName in this._queue){
      this.off(eventName)
    }

    return this
  }
}
