import { findElementByType } from '../../../common/src/util/helpers'
import { mutateCanvasInfoData } from '../../src/webrtc/helpers'

describe('Helpers browser functions', () => {
  describe('findElementByType', () => {
    it('should return null if there is no document global object', () => {
      document = null
      expect(findElementByType('fakeElement')).toEqual(null)
    })

    it('should select the DOM element by ID', () => {
      const fake = document.createElement('div')
      fake.id = 'fakeElement'
      document.getElementById = jest.fn().mockReturnValue(fake)
      expect(findElementByType('fakeElement')).toEqual(fake)
    })

    it('should return null if the DOM element does not exists', () => {
      const fake = document.createElement('div')
      fake.id = 'fakeElement'
      // @ts-ignore
      document.getElementById.mockRestore()
      expect(findElementByType('fake-Element')).toEqual(null)
    })

    it('should select the DOM element by a Function', () => {
      const fake = document.createElement('div')
      fake.id = 'fakeElement'
      expect(findElementByType(jest.fn().mockReturnValue(fake))).toEqual(fake)
    })
  })

  describe('mutateCanvasInfoData', () => {

    it('should transform canvasInfo for 1 people', () => {
      const canvasInfo = JSON.parse(`{"canvasID":-1,"totalLayers":1,"layersUsed":1,"layoutFloorID":0,"layoutName":"1x1","canvasLayouts":[{"x":0,"y":0,"scale":360,"hscale":360,"zoom":0,"border":0,"floor":1,"overlap":0,"screenWidth":1280,"screenHeight":720,"xPOS":0,"yPOS":0,"audioPOS":"0.000000:0.0:1.000000","memberID":116}],"scale":360}`)
      const result = mutateCanvasInfoData(canvasInfo)
      const expected = JSON.parse(`{"canvasId":-1,"totalLayers":1,"layersUsed":1,"layoutFloorId":0,"layoutName":"1x1","canvasLayouts":[{"startX":"0%","startY":"0%","percentageWidth":"100%","percentageHeight":"100%","x":0,"y":0,"scale":360,"hscale":360,"zoom":0,"border":0,"floor":1,"overlap":0,"screenWidth":1280,"screenHeight":720,"xPos":0,"yPos":0,"audioPos":"0.000000:0.0:1.000000","participantId":"116"}],"scale":360,"layoutOverlap":false}`)
      expect(result).toStrictEqual(expected)
    })

    it('should transform canvasInfo with 2 people', () => {
      const canvasInfo = JSON.parse(`{"canvasID":-1,"totalLayers":2,"layersUsed":2,"layoutFloorID":-1,"layoutName":"2x1","canvasLayouts":[{"x":0,"y":90,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPOS":0,"yPOS":180,"audioPOS":"-1.000000:0.0:1.000000","memberID":116},{"x":180,"y":90,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPOS":640,"yPOS":180,"audioPOS":"0.500000:0.0:1.000000","memberID":107}],"scale":360}`)
      const result = mutateCanvasInfoData(canvasInfo)
      const expected = JSON.parse(`{"canvasId":-1,"totalLayers":2,"layersUsed":2,"layoutFloorId":-1,"layoutName":"2x1","canvasLayouts":[{"startX":"0%","startY":"25%","percentageWidth":"50%","percentageHeight":"50%","x":0,"y":90,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPos":0,"yPos":180,"audioPos":"-1.000000:0.0:1.000000","participantId":"116"},{"startX":"50%","startY":"25%","percentageWidth":"50%","percentageHeight":"50%","x":180,"y":90,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPos":640,"yPos":180,"audioPos":"0.500000:0.0:1.000000","participantId":"107"}],"scale":360,"layoutOverlap":false}`)
      expect(result).toStrictEqual(expected)
    })

    it('should transform canvasInfo with 3 people', () => {
      const canvasInfo = JSON.parse(`{"canvasID":-1,"totalLayers":3,"layersUsed":3,"layoutFloorID":-1,"layoutName":"1x1+2x1","canvasLayouts":[{"x":90,"y":0,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPOS":320,"yPOS":0,"audioPOS":"0.000000:0.0:0.500000","memberID":121},{"x":0,"y":180,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPOS":0,"yPOS":360,"audioPOS":"-1.000000:0.0:-1.000000","memberID":116},{"x":180,"y":180,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPOS":640,"yPOS":360,"audioPOS":"0.500000:0.0:-1.000000","memberID":107}],"scale":360}`)
      const result = mutateCanvasInfoData(canvasInfo)
      const expected = JSON.parse(`{"canvasId":-1,"totalLayers":3,"layersUsed":3,"layoutFloorId":-1,"layoutName":"1x1+2x1","canvasLayouts":[{"startX":"25%","startY":"0%","percentageWidth":"50%","percentageHeight":"50%","x":90,"y":0,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPos":320,"yPos":0,"audioPos":"0.000000:0.0:0.500000","participantId":"121"},{"startX":"0%","startY":"50%","percentageWidth":"50%","percentageHeight":"50%","x":0,"y":180,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPos":0,"yPos":360,"audioPos":"-1.000000:0.0:-1.000000","participantId":"116"},{"startX":"50%","startY":"50%","percentageWidth":"50%","percentageHeight":"50%","x":180,"y":180,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPos":640,"yPos":360,"audioPos":"0.500000:0.0:-1.000000","participantId":"107"}],"scale":360,"layoutOverlap":false}`)
      expect(result).toStrictEqual(expected)
    })

    it('should transform canvasInfo with 4 participants', () => {
      const canvasInfo = JSON.parse(`{"canvasID":0,"totalLayers":4,"layersUsed":4,"layoutFloorID":-1,"layoutName":"2x2","canvasLayouts":[{"x":0,"y":0,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPOS":0,"yPOS":0,"audioPOS":"-1.000000:0.0:0.500000","memberID":121},{"x":180,"y":0,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPOS":640,"yPOS":0,"audioPOS":"0.500000:0.0:0.500000","memberID":116},{"x":0,"y":180,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPOS":0,"yPOS":360,"audioPOS":"-1.000000:0.0:-1.000000","memberID":107},{"x":180,"y":180,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPOS":640,"yPOS":360,"audioPOS":"0.500000:0.0:-1.000000","memberID":104}],"scale":360}`)
      const result = mutateCanvasInfoData(canvasInfo)
      const expected = JSON.parse(`{"canvasId":0,"totalLayers":4,"layersUsed":4,"layoutFloorId":-1,"layoutName":"2x2","canvasLayouts":[{"startX":"0%","startY":"0%","percentageWidth":"50%","percentageHeight":"50%","x":0,"y":0,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPos":0,"yPos":0,"audioPos":"-1.000000:0.0:0.500000","participantId":"121"},{"startX":"50%","startY":"0%","percentageWidth":"50%","percentageHeight":"50%","x":180,"y":0,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPos":640,"yPos":0,"audioPos":"0.500000:0.0:0.500000","participantId":"116"},{"startX":"0%","startY":"50%","percentageWidth":"50%","percentageHeight":"50%","x":0,"y":180,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPos":0,"yPos":360,"audioPos":"-1.000000:0.0:-1.000000","participantId":"107"},{"startX":"50%","startY":"50%","percentageWidth":"50%","percentageHeight":"50%","x":180,"y":180,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPos":640,"yPos":360,"audioPos":"0.500000:0.0:-1.000000","participantId":"104"}],"scale":360,"layoutOverlap":false}`)
      expect(result).toStrictEqual(expected)
    })

    it('should transform canvasInfo with overlap', () => {
      const canvasInfo = JSON.parse(`{"canvasID":-1,"totalLayers":2,"layersUsed":2,"layoutFloorID":1,"layoutName":"presenter-floor-small-top-right","canvasLayouts":[{"x":0,"y":0,"scale":360,"hscale":360,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":1280,"screenHeight":720,"xPOS":0,"yPOS":0,"resID":"screen","audioPOS":"0.000000:0.0:1.000000","memberID":1114},{"x":300,"y":0,"scale":60,"hscale":60,"zoom":0,"border":0,"floor":1,"overlap":1,"screenWidth":213,"screenHeight":120,"xPOS":1066,"yPOS":0,"audioPOS":"0.831250:0.0:0.166667","memberID":1113}],"scale":360}`)
      const result = mutateCanvasInfoData(canvasInfo)
      const expected = JSON.parse(`{"canvasId":-1,"totalLayers":2,"layersUsed":2,"layoutFloorId":1,"layoutName":"presenter-floor-small-top-right","canvasLayouts":[{"startX":"0%","startY":"0%","percentageWidth":"100%","percentageHeight":"100%","x":0,"y":0,"scale":360,"hscale":360,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":1280,"screenHeight":720,"xPos":0,"yPos":0,"resID":"screen","audioPos":"0.000000:0.0:1.000000","participantId":"1114"},{"startX":"83.33%","startY":"0%","percentageWidth":"16.67%","percentageHeight":"16.67%","x":300,"y":0,"scale":60,"hscale":60,"zoom":0,"border":0,"floor":1,"overlap":1,"screenWidth":213,"screenHeight":120,"xPos":1066,"yPos":0,"audioPos":"0.831250:0.0:0.166667","participantId":"1113"}],"scale":360,"layoutOverlap":true}`)
      expect(result).toStrictEqual(expected)
    })

  })
})
