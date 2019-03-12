import { register, registerOnce, deRegister, deRegisterAll, trigger, monitorCallbackQueue } from '../src/services/Handler'

describe('Handler', () => {
  const fnMock = jest.fn()
  const eventName = 'EventNameTest'
  const uniqueId = 'f209313b-a6ea-4550-897b-4e2b50c8ffbb'

  beforeEach(() => {
    deRegister(eventName, null)
    deRegister(eventName, null, uniqueId)
    fnMock.mockClear()
  })

  describe('register()', () => {
    it('register a listener without uniqueId', () => {
      register(eventName, fnMock)
      expect(monitorCallbackQueue()).toHaveProperty(eventName)
      expect(monitorCallbackQueue()[eventName]).toHaveProperty('GLOBAL')
      expect(monitorCallbackQueue()[eventName]['GLOBAL']).toEqual([fnMock])
    })

    it('register a listener with a uniqueId', () => {
      register(eventName, fnMock, uniqueId)
      expect(monitorCallbackQueue()).toHaveProperty(eventName)
      expect(monitorCallbackQueue()[eventName]).toHaveProperty(uniqueId)
      expect(monitorCallbackQueue()[eventName]).not.toHaveProperty('GLOBAL')
      expect(monitorCallbackQueue()[eventName][uniqueId]).toEqual([fnMock])
    })
  })

  describe('registerOnce()', () => {
    it('register a listener without uniqueId and remove it after the first call', () => {
      registerOnce(eventName, fnMock)
      expect(monitorCallbackQueue()).toHaveProperty(eventName)
      expect(monitorCallbackQueue()[eventName]).toHaveProperty('GLOBAL')

      trigger(eventName, null)

      expect(monitorCallbackQueue()).not.toHaveProperty(eventName)
      expect(monitorCallbackQueue()).toMatchObject({})
    })

    it('register a listener with uniqueId and remove it after the first call', () => {
      registerOnce(eventName, fnMock, uniqueId)
      expect(monitorCallbackQueue()).toHaveProperty(eventName)
      expect(monitorCallbackQueue()[eventName]).toHaveProperty(uniqueId)
      expect(monitorCallbackQueue()[eventName]).not.toHaveProperty('GLOBAL')

      trigger(eventName, null, uniqueId)

      expect(fnMock).toHaveBeenCalled()
      expect(monitorCallbackQueue()).not.toHaveProperty(eventName)
      expect(monitorCallbackQueue()).toMatchObject({})
    })
  })

  describe('deRegister()', () => {
    describe('passing callback reference', () => {
      it('should remove a registered callback from the queue', () => {
        register(eventName, fnMock)
        register(eventName, fnMock, uniqueId)

        deRegister(eventName, fnMock)
        expect(monitorCallbackQueue()[eventName]).toHaveProperty(uniqueId)
        expect(monitorCallbackQueue()[eventName]).not.toHaveProperty('GLOBAL')

        deRegister(eventName, fnMock, uniqueId)
        expect(monitorCallbackQueue()).toMatchObject({})
      })
    })

    describe('without passing callback reference', () => {
      it('should remove a registered callback from the queue', () => {
        register(eventName, fnMock)
        register(eventName, fnMock, uniqueId)

        deRegister(eventName)
        expect(monitorCallbackQueue()).toMatchObject({})
      })
    })

    describe('with multiple callbacks on the same event name', () => {
      it('should remove a registered callback from the queue', () => {
        registerOnce(eventName, fnMock, uniqueId)
        registerOnce(eventName, fnMock, uniqueId)

        trigger(eventName, null, uniqueId)

        expect(fnMock).toHaveBeenCalledTimes(2)
        expect(monitorCallbackQueue()).toMatchObject({})
      })
    })
  })

  describe('trigger()', () => {
    it('should call the cached callback in the queue', () => {
      register(eventName, fnMock)

      trigger(eventName, null)
      trigger(eventName, null)
      trigger(eventName, null)

      expect(fnMock).toHaveBeenCalledTimes(3)
      expect(fnMock).toBeCalledWith(null)
    })

    it('should call the global callback when propagation is set to true', () => {
      const fnMock2 = jest.fn()

      register(eventName, fnMock)
      // register(eventName, fnMock2, uniqueId)

      trigger(eventName, null, uniqueId)

      expect(fnMock2).not.toHaveBeenCalled()
      expect(fnMock).toHaveBeenCalledTimes(1)
      expect(fnMock).toBeCalledWith(null)
    })

    it('should not call the global callback when propagation is set to false', () => {
      const fnMock2 = jest.fn()

      register(eventName, fnMock)
      register(eventName, fnMock2, uniqueId)

      trigger(eventName, null, uniqueId, false)

      expect(fnMock).not.toHaveBeenCalled()
      expect(fnMock2).toHaveBeenCalledTimes(1)
      expect(fnMock2).toBeCalledWith(null)
    })
  })

  describe('deRegisterAll()', () => {
    it('should remove all registered callbacks for that given eventName', () => {
      register(eventName, fnMock)
      register(eventName, fnMock, uniqueId)

      deRegisterAll(eventName)
      expect(monitorCallbackQueue()).not.toHaveProperty(eventName)

      trigger(eventName, null)
      trigger(eventName, null, uniqueId)
      expect(fnMock).not.toHaveBeenCalled()
    })
  })
})
