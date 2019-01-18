export const mockResponse = jest.fn(() => 'default')

export const mockSend = jest.fn((bladeObj: any) => {
  const { request } = bladeObj
  return new Promise((resolve, reject) => {
    if (!request.hasOwnProperty('result')) {
      const response = mockResponse()
      response.hasOwnProperty('error') ? reject(response.error) : resolve(response.result)
    } else {
      resolve()
    }
  })
})

export const mockClose = jest.fn()

export const connected = jest.fn().mockReturnValue(true)

const mock = jest.fn().mockImplementation(() => {
  const mocked = {
    send: mockSend,
    close: mockClose
  }
  Object.defineProperty(mocked, 'connected', {
    get: () => connected()
  })
  return mocked
})

export default mock
