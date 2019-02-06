import { findElementByType } from '../../common/src/util/helpers'

describe('Helpers browser functions', function () {
  describe('findElementByType', function () {
    it('should return null if there is no document global object', function () {
      document = null
      expect(findElementByType('fakeElement')).toEqual(null)
    })

    it('should select the DOM element by ID', function () {
      const fake = document.createElement('div')
      fake.id = 'fakeElement'
      document.getElementById = jest.fn().mockReturnValue(fake)
      expect(findElementByType('fakeElement')).toEqual(fake)
    })

    it('should return null if the DOM element does not exists', function () {
      const fake = document.createElement('div')
      fake.id = 'fakeElement'
      // @ts-ignore
      document.getElementById.mockRestore()
      expect(findElementByType('fake-Element')).toEqual(null)
    })

    it('should select the DOM element by a Function', function () {
      const fake = document.createElement('div')
      fake.id = 'fakeElement'
      expect(findElementByType(jest.fn().mockReturnValue(fake))).toEqual(fake)
    })
  })
})
