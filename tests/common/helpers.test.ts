import { cleanNumber, objEmpty, mutateLiveArrayData, safeParseJson, isDefined, findElementByType } from '../../src/util/helpers'

describe('Helpers functions', function () {
  describe('cleanNumber', function () {
    it('should clear a number starting with 1', function () {
      const number = '1-650.382.0000'
      expect(cleanNumber(number)).toEqual('+16503820000')
    })
    it('should clear a number not starting with 1', function () {
      const number = '650.382.0000'
      expect(cleanNumber(number)).toEqual('+16503820000')
    })
    it('should clear a number already cleaned', function () {
      const number = '+6503820000'
      expect(cleanNumber(number)).toEqual('+16503820000')
      const number2 = '+16503820000'
      expect(cleanNumber(number2)).toEqual('+16503820000')
    })
  })

  describe('objEmpty', function () {
    it('should return true if object has no values', function () {
      const tmp = { test: 1234 }
      expect(objEmpty(tmp)).toEqual(false)

      const tmp1 = {}
      expect(objEmpty(tmp1)).toEqual(true)
    })
  })

  describe('mutateLiveArrayData', function () {
    it('should filter data from liveArray', function () {
      const data = JSON.parse('["0067","email@domain.com","Js Client Test","opus@48000","{\\"audio\\":{\\"muted\\":false,\\"deaf\\":false,\\"onHold\\":false,\\"talking\\":true,\\"floor\\":true,\\"energyScore\\":1159},\\"video\\":{\\"visible\\":true,\\"videoOnly\\":false,\\"avatarPresented\\":false,\\"mediaFlow\\":\\"sendRecv\\",\\"muted\\":false,\\"floor\\":true,\\"reservationID\\":null,\\"roleID\\":null,\\"videoLayerID\\":1},\\"oldStatus\\":\\"TALKING (FLOOR) VIDEO (FLOOR)\\"}",{"email":"email","avatar":"avatar"},null]')
      const media = JSON.parse('{"audio":{"muted":false,"deaf":false,"onHold":false,"talking":true,"floor":true,"energyScore":1159},"video":{"visible":true,"videoOnly":false,"avatarPresented":false,"mediaFlow":"sendRecv","muted":false,"floor":true,"reservationId":null,"roleId":null,"videoLayerId":1},"oldStatus":"TALKING (FLOOR) VIDEO (FLOOR)"}')
      expect(mutateLiveArrayData(data)).toMatchObject({ participantId: 67, participantNumber: 'email@domain.com', participantName: 'Js Client Test', codec: 'opus@48000', media, participantData: { email: 'email', avatar: 'avatar' } })
    })
  })

  describe('safeParseJson', function () {
    it('should parse a valid JSON string', function () {
      const jsonString = '{"jsonrpc":"2.0","id":"fb5daf53-14f9-4972-8ece-310824054da8","method":"blade.execute"}'
      expect(safeParseJson(jsonString)).toMatchObject({ jsonrpc: '2.0', id: 'fb5daf53-14f9-4972-8ece-310824054da8', method: 'blade.execute'})
    })

    it('return the input parameter if its not a string', function () {
      const obj = { jsonrpc: '2.0', id: 'fb5daf53-14f9-4972-8ece-310824054da8', method: 'blade.execute' }
      // @ts-ignore
      expect(safeParseJson(obj)).toMatchObject({ jsonrpc: '2.0', id: 'fb5daf53-14f9-4972-8ece-310824054da8', method: 'blade.execute'})
      // @ts-ignore
      expect(safeParseJson(null)).toEqual(null)
      // @ts-ignore
      expect(safeParseJson(true)).toEqual(true)
    })
  })

  describe('isDefined', function () {
    it('should return true if the variable is defined', function () {
      const obj = { key: 'value' }
      expect(isDefined(obj.key)).toEqual(true)
    })

    it('should return false if the variable is undefined', function () {
      const obj = { key: 'value' }
      // @ts-ignore
      expect(isDefined(obj.key2)).toEqual(false)
      expect(isDefined(undefined)).toEqual(false)
      delete obj.key
      expect(isDefined(obj.key)).toEqual(false)
    })
  })

  // describe('findElementByType', function () {
  //   it('should return null if there is no document global object', function () {
  //     document = null
  //     expect(findElementByType('fakeElement')).toEqual(null)
  //   })

  //   it('should select the DOM element by ID', function () {
  //     const fake = document.createElement('div')
  //     fake.id = 'fakeElement'
  //     document.getElementById = jest.fn().mockReturnValue(fake)
  //     expect(findElementByType('fakeElement')).toEqual(fake)
  //   })

  //   it('should return null if the DOM element does not exists', function () {
  //     const fake = document.createElement('div')
  //     fake.id = 'fakeElement'
  //     // @ts-ignore
  //     document.getElementById.mockRestore()
  //     expect(findElementByType('fake-Element')).toEqual(null)
  //   })

  //   it('should select the DOM element by a Function', function () {
  //     const fake = document.createElement('div')
  //     fake.id = 'fakeElement'
  //     expect(findElementByType(jest.fn().mockReturnValue(fake))).toEqual(fake)
  //   })
  // })
})
