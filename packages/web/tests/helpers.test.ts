import { findElementByType } from '../../common/src/util/helpers'

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
})
