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

export const mockClose = jest.fn(() => {
  console.warn('Mock socket closing...')
})

const mock = jest.fn().mockImplementation(() => {
  return {
    send: mockSend,
    close: mockClose
  }
})

export default mock
