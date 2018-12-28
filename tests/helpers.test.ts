import { validateOptions, cleanNumber, objEmpty, mutateLiveArrayData } from '../src/util/helpers'
import { ISignalWireOptions } from '../src/interfaces'

describe('Helpers functions', function () {
  describe('validateOptions', function () {
    it('should return true with valid SignalWire params', function () {
      const params: ISignalWireOptions = { host: 'fs.example.com', project: 'project', token: 'token' }
      expect(validateOptions(params, 'SignalWire')).toEqual(true)
    })

    it('should return false with invalid SignalWire params', function () {
      const params: ISignalWireOptions = { host: 'fs.example.com', project: '' }
      expect(validateOptions(params, 'SignalWire')).toEqual(false)
    })

    it('should return true with valid Verto params', function () {
      const params1: ISignalWireOptions = { host: 'fs.example.com', login: 'login', passwd: '1234' }
      expect(validateOptions(params1, 'Verto')).toEqual(true)
      const params2: ISignalWireOptions = { host: 'fs.example.com', login: 'login', password: '1234' }
      expect(validateOptions(params2, 'Verto')).toEqual(true)
    })

    it('should return false with invalid SignalWire params', function () {
      const params: ISignalWireOptions = { host: 'fs.example.com', project: '', token: 'token' }
      expect(validateOptions(params, 'SignalWire')).toEqual(false)
    })
  })

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
})
