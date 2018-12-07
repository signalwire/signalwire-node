import { validateOptions, cleanNumber, objEmpty } from '../src/util/helpers'
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
      expect(validateOptions(params1, 'SignalWire')).toEqual(true)
      const params2: ISignalWireOptions = { host: 'fs.example.com', login: 'login', password: '1234' }
      expect(validateOptions(params2, 'SignalWire')).toEqual(true)
    })

    it('should return false with invalid SignalWire params', function () {
      const params: ISignalWireOptions = { host: 'fs.example.com', project: '', token: 'token' }
      expect(validateOptions(params, 'SignalWire')).toEqual(false)
    })
  })

  // describe('cleanNumber', function () {
  //   it('should match struct without sessionId', function () {
  //     const message = new Connect({ project: 'project', token: 'token' }).request
  //     const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"blade.connect","params":{"authentication":{"project":"project","token":"token"},"version":{"major":2,"minor":1,"revision":0}}}`)
  //     expect(message).toEqual(res)
  //   })
  //   it('should match struct with sessionId', function () {
  //     const sessionId = '5c26c8d1-adcc-4b46-aa32-d9550022fddc'
  //     const message = new Connect({ project: 'project', token: 'token' }, sessionId).request
  //     const res = JSON.parse(`{"jsonrpc":"2.0","id":"${message.id}","method":"blade.connect","params":{"authentication":{"project":"project","token":"token"},"version":{"major":2,"minor":1,"revision":0},"sessionid":"${sessionId}"}}`)
  //     expect(message).toEqual(res)
  //   })
  // })

  describe('objEmpty', function () {
    it('should return true if object has no values', function () {
      const tmp = { test: 1234 }
      expect(objEmpty(tmp)).toEqual(false)

      const tmp1 = {}
      expect(objEmpty(tmp1)).toEqual(true)
    })
  })
})
