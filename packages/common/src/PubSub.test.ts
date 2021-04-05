import { EventPubSub } from './PubSub'

describe('EventPubSub Class', () => {
  let instance: EventPubSub = null
  const exampleData = {
    test: 'data',
    random: 'data',
  }
  const eventName = 'event'

  beforeEach(() =>{
    instance = new EventPubSub()
  })

  describe('.on() method', () => {
    it('should append an handler for the specified eventName', () => {
      const mockCallback = jest.fn()
      instance.on(eventName, mockCallback)

      instance.emit(eventName, exampleData)
      instance.emit(eventName, 'other stuff')

      expect(mockCallback).toHaveBeenCalledTimes(2)
      expect(mockCallback).toHaveBeenNthCalledWith(1, exampleData)
      expect(mockCallback).toHaveBeenNthCalledWith(2, 'other stuff')
    })

    it('should append multiple handlers for the same eventName', () => {
      const mockCallback = jest.fn()
      instance.on(eventName, mockCallback)
      instance.on(eventName, mockCallback)

      const anotherMockCallback = jest.fn()
      instance.on('another-event', anotherMockCallback)

      instance.emit(eventName, exampleData)

      expect(mockCallback).toHaveBeenCalledTimes(2)
      expect(mockCallback).toHaveBeenNthCalledWith(1, exampleData)
      expect(mockCallback).toHaveBeenNthCalledWith(2, exampleData)

      expect(anotherMockCallback).not.toHaveBeenCalled()
    })
  })

  describe('.once() method', () => {
    it('should trigger the callback just once', () => {
      const mockCallback = jest.fn()
      instance.once(eventName, mockCallback)

      instance.emit(eventName, 'one time only!')
      instance.emit(eventName, 'one time only!')
      instance.emit(eventName, 'one time only!')

      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenNthCalledWith(1, 'one time only!')
    })

    it('should trigger the callback when called multiple times', () => {
      const mockCallback = jest.fn()
      instance.once(eventName, mockCallback)
      instance.once(eventName, mockCallback)
      instance.once(eventName, mockCallback)

      instance.emit(eventName, exampleData)

      expect(mockCallback).toHaveBeenCalledTimes(3)
      expect(mockCallback).toHaveBeenCalledWith(exampleData)
    })
  })

  describe('.off() method', () => {
    it('should remove the callback from the queue added with on', () => {
      const mockCallback = jest.fn()
      instance.on(eventName, mockCallback)

      instance.emit(eventName, exampleData)
      instance.off(eventName, mockCallback)

      instance.emit(eventName, 'no-op')
      instance.emit(eventName, 'no-op')

      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenNthCalledWith(1, exampleData)
    })

    it('should remove the callback from the queue added with once', () => {
      const mockCallback = jest.fn()
      instance.once(eventName, mockCallback)
      instance.off(eventName, mockCallback)

      instance.emit(eventName, 'no-op')

      expect(mockCallback).not.toHaveBeenCalled()
    })

    it('should remove all the callbacks from the queue without the handler as argument', () => {
      const mockCallback = jest.fn()
      instance.on(eventName, mockCallback)

      instance.off(eventName)

      instance.emit(eventName, 'no-op')

      expect(mockCallback).not.toHaveBeenCalled()
    })
  })

  describe('.reset() method', () => {
    it('should reset the queue', () => {
      const mockCallback1 = jest.fn()
      instance.on(eventName, mockCallback1)

      const mockCallback2 = jest.fn()
      instance.on('otherEvent', mockCallback2)

      const mockCallback3 = jest.fn()
      instance.on('anotherEvent', mockCallback3)

      instance.reset()

      instance.emit(eventName, 'no-op')
      instance.emit('otherEvent', 'no-op')
      instance.emit('anotherEvent', 'no-op')

      expect(mockCallback1).not.toHaveBeenCalled()
      expect(mockCallback2).not.toHaveBeenCalled()
      expect(mockCallback3).not.toHaveBeenCalled()
    })
  })
})
