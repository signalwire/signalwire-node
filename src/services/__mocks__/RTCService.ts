export const getDevices = jest.fn()
  .mockImplementation(() => {
    return new Promise((resolve, reject) => {
      resolve({
        videoinput: {
          'camId': { device: 'mocked' }
        },
        audioinput: {
          'micId': { device: 'mocked' },
          'micId-edit': { device: 'mocked' },
        },
        audiooutput: {
          'speakerId': { device: 'mocked' }
        }
      })
    })
  })
