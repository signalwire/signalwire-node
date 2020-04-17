import WebRTCCall from './WebRTCCall'
import Conference from './Conference'

/* tslint:disable-next-line */
// export function InjectConferenceMethods(klass: Function) {
//   const methods = [
//     'sendChatMessage', 'listVideoLayouts', 'playMedia', 'stopMedia', 'startRecord', 'stopRecord',
//     'snapshot', 'setVideoLayout', 'kick', 'presenter', 'videoFloor', 'banner',
//     'volumeDown', 'volumeUp', 'gainDown', 'gainUp', 'toggleNoiseBlocker', 'toggleLowBitrateMode',
//     'toggleHandRaised', 'confQuality', 'confFullscreen', 'addToCall', 'modCommand'
//   ]
//   methods.forEach(method => {
//     Object.defineProperty(klass.prototype, method, {
//       value: function () {
//         if (this.conference instanceof Conference) {
//           return this.conference[method](...arguments)
//         }
//         console.warn(`Invalid method: ${method}. This Call is not a Conference.`)
//       }
//     })
//   })
// }

/* tslint:disable-next-line */
export function CheckConferenceMethod(target: WebRTCCall, key: string, descriptor: PropertyDescriptor) {
  if (descriptor === undefined) {
    descriptor = Object.getOwnPropertyDescriptor(target, key)
  }
  const originalMethod = descriptor.value
  descriptor.value = function () {
    if (this.conference instanceof Conference) {
      if (!this.conference[key]) {
        return console.warn(`The method '${key}' does not exist on Conference.`)
      }
      return this.conference[key](...arguments)
    }
    return originalMethod.apply(this, arguments)
  }
  return descriptor
}
