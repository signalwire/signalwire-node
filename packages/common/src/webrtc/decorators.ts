import WebRTCCall from './WebRTCCall'
import Conference from './Conference'

export function ConferenceCheck(target: WebRTCCall, key: string, descriptor: PropertyDescriptor) {
  if (descriptor === undefined) {
    descriptor = Object.getOwnPropertyDescriptor(target, key)
  }
  const originalMethod = descriptor.value
  descriptor.value = function () {
    if (this.conference instanceof Conference) {
      return this.conference[key](...arguments)
    }
    return originalMethod.apply(this, arguments)
  }
  return descriptor
}
