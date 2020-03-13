import WebRTCCall from './WebRTCCall'
import Conference from './Conference'

export function InjectConferenceMethods() {
  return (klass: Function) => {
    const methods = [
      'listVideoLayouts', 'playMedia', 'stopMedia', 'startRecord', 'stopRecord', 'snapshot', 'setVideoLayout', 'kick', 'presenter', 'videoFloor', 'banner', 'volumeDown', 'volumeUp', 'gainDown', 'gainUp'
    ]
    methods.forEach(method => {
      Object.defineProperty(klass.prototype, method, {
        value: function () {
          console.log('Invoke:', method)
          this.conference[method](...arguments)
        }
      })
    })
  }
}

export function CheckConferenceMethod(target: WebRTCCall, key: string, descriptor: PropertyDescriptor) {
  if (descriptor === undefined) {
    descriptor = Object.getOwnPropertyDescriptor(target, key)
  }
  const originalMethod = descriptor.value
  descriptor.value = function () {
    if (this.conference instanceof Conference) {
      if (!this.conference[key]) {
        return console.warn(`The method '${key}' does not exist on Conference yet.`)
      }
      return this.conference[key](...arguments)
    }
    return originalMethod.apply(this, arguments)
  }
  return descriptor
}
