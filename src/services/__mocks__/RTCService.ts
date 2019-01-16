export const getDevices = jest.fn().mockResolvedValue({
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

export const streamIsValid = jest.fn().mockReturnValue(false)

export const checkPermissions = jest.fn().mockResolvedValue(true)

export const assureDeviceId = jest.fn().mockImplementation((id: string, label: string) => Promise.resolve(id))
