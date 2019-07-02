export const mockResponse = jest.fn((): { result: any, error?: string } => ({ result: 'fake' }))

export const mockSendRawText = jest.fn((str: string) => {})

export const mockSend = jest.fn((bladeObj: any) => {
  const { request } = bladeObj
  return new Promise((resolve, reject) => {
    if (!request.hasOwnProperty('result')) {
      const { result, error } = mockResponse()
      if (error) {
        return reject(error)
      }
      if (result === 'fake') {
        return resolve(result)
      }
      if (result) {
        const { result: { code = null, node_id = null, result: nestedResult = null } = {} } = result
        if (code && code !== '200') {
          reject(result)
        } else if (nestedResult) {
          nestedResult.node_id = node_id
          resolve(nestedResult)
        } else {
          resolve(result)
        }
      }
    } else {
      resolve()
    }
  })
})

export const mockClose = jest.fn()

export const connected = jest.fn().mockReturnValue(true)
export const isAlive = jest.fn().mockReturnValue(true)

const mock = jest.fn().mockImplementation(() => {
  const mocked = {
    sendRawText: mockSendRawText,
    send: mockSend,
    close: mockClose
  }
  Object.defineProperty(mocked, 'connected', {
    get: () => connected()
  })
  Object.defineProperty(mocked, 'isAlive', {
    get: () => isAlive()
  })
  return mocked
})

export default mock
