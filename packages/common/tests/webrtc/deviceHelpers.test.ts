import { getDevices, getDevicesWithPermissions, assureDeviceId } from '../../src/webrtc/deviceHelpers'

describe('Helpers browser functions', () => {
  const DEVICES_CAMERA_NO_LABELS = [
    { 'deviceId': 'uuid', 'kind': 'audioinput', 'label': 'mic1', 'groupId': '83ef347b97d14abd837e8c6dbb819c5be84cfe0756dd41455b375cfd4c0ddb4f' },
    { 'deviceId': 'uuid', 'kind': 'audioinput', 'label': 'mic2', 'groupId': '83ef347b97d14abd837e8c6dbb819c5be84cfe0756dd41455b375cfd4c0ddb4f' },
    { 'deviceId': 'uuid', 'kind': 'audioinput', 'label': 'mic3', 'groupId': '67a612f4ac80c6c9854b50d664348e69b5a11421a0ba8d68e2c00f3539992b4c' },

    { 'deviceId': 'uuid', 'kind': 'videoinput', 'label': '', 'groupId': '72e8ab9444144c3f8e04276a5801e520e83fc801702a6ef68e9e344083f6f6ce' },
    { 'deviceId': 'uuid', 'kind': 'videoinput', 'label': '', 'groupId': '67a612f4ac80c6c9854b50d664348e69b5a11421a0ba8d68e2c00f3539992b4c' },

    { 'deviceId': 'uuid', 'kind': 'audiooutput', 'label': 'speaker1', 'groupId': '83ef347b97d14abd837e8c6dbb819c5be84cfe0756dd41455b375cfd4c0ddb4f' },
    { 'deviceId': 'uuid', 'kind': 'audiooutput', 'label': 'speaker2', 'groupId': '83ef347b97d14abd837e8c6dbb819c5be84cfe0756dd41455b375cfd4c0ddb4f' },
  ]

  const DEVICES_MICROPHONE_NO_LABELS = [
    { 'deviceId': 'uuid', 'kind': 'audioinput', 'label': '', 'groupId': '83ef347b97d14abd837e8c6dbb819c5be84cfe0756dd41455b375cfd4c0ddb4f' },
    { 'deviceId': 'uuid', 'kind': 'audioinput', 'label': '', 'groupId': '83ef347b97d14abd837e8c6dbb819c5be84cfe0756dd41455b375cfd4c0ddb4f' },
    { 'deviceId': 'uuid', 'kind': 'audioinput', 'label': '', 'groupId': '67a612f4ac80c6c9854b50d664348e69b5a11421a0ba8d68e2c00f3539992b4c' },

    { 'deviceId': 'uuid', 'kind': 'videoinput', 'label': 'camera1', 'groupId': '72e8ab9444144c3f8e04276a5801e520e83fc801702a6ef68e9e344083f6f6ce' },
    { 'deviceId': 'uuid', 'kind': 'videoinput', 'label': 'camera2', 'groupId': '67a612f4ac80c6c9854b50d664348e69b5a11421a0ba8d68e2c00f3539992b4c' },

    { 'deviceId': 'uuid', 'kind': 'audiooutput', 'label': 'speaker1', 'groupId': '83ef347b97d14abd837e8c6dbb819c5be84cfe0756dd41455b375cfd4c0ddb4f' },
    { 'deviceId': 'uuid', 'kind': 'audiooutput', 'label': 'speaker2', 'groupId': '83ef347b97d14abd837e8c6dbb819c5be84cfe0756dd41455b375cfd4c0ddb4f' },
  ]

  describe('getDevicesWithPermissions', () => {

    beforeEach(() => {
      // @ts-ignore
      navigator.mediaDevices.getUserMedia.mockClear()
    })

    it('should return the device list removing the duplicates', async done => {
      const devices = await getDevicesWithPermissions()
      expect(devices).toHaveLength(5)
      done()
    })

    it('should return the full device list', async done => {
      const devices = await getDevicesWithPermissions(null, true)
      expect(devices).toHaveLength(7)
      done()
    })

    it('should return the audioIn device list with kind audioinput', async done => {
      const devices = await getDevicesWithPermissions('audioinput')
      expect(devices).toHaveLength(2)
      expect(devices[0].deviceId).toEqual('default')
      done()
    })

    it('should return the video device list with kind videoinput', async done => {
      const devices = await getDevicesWithPermissions('videoinput')
      expect(devices).toHaveLength(2)
      expect(devices[0].deviceId).toEqual('2060bf50ab9c29c12598bf4eafeafa71d4837c667c7c172bb4407ec6c5150206')
      done()
    })

    it('should return the audioOut device list with kind audiooutput', async done => {
      const devices = await getDevicesWithPermissions('audiooutput')
      expect(devices).toHaveLength(1)
      expect(devices[0].deviceId).toEqual('default')
      done()
    })

    describe('without camera permissions', () => {
      it('should invoke getUserMedia to request camera permissions and return device list removing duplicates', async done => {
        // @ts-ignore
        navigator.mediaDevices.enumerateDevices.mockResolvedValueOnce(DEVICES_CAMERA_NO_LABELS)
        const devices = await getDevicesWithPermissions()
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1)
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true, video: true })
        expect(devices).toHaveLength(5)
        expect(devices[0].label).toEqual('Default - External Microphone (Built-in)')
        expect(devices.every((d: MediaDeviceInfo) => (d.deviceId && d.label))).toBe(true)
        done()
      })
    })

    describe('without microphone permissions', () => {
      it('should invoke getUserMedia to request microphone permissions and return device list removing duplicates', async done => {
        // @ts-ignore
        navigator.mediaDevices.enumerateDevices.mockResolvedValueOnce(DEVICES_MICROPHONE_NO_LABELS)
        const devices = await getDevicesWithPermissions()
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1)
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true, video: true })
        expect(devices).toHaveLength(5)
        expect(devices[0].label).toEqual('Default - External Microphone (Built-in)')
        expect(devices.every((d: MediaDeviceInfo) => (d.deviceId && d.label))).toBe(true)
        done()
      })
    })

  })

  describe('getDevices', () => {

    beforeEach(() => {
      // @ts-ignore
      navigator.mediaDevices.getUserMedia.mockClear()
    })

    it('should return the device list removing the duplicates', async done => {
      const devices = await getDevices()
      expect(devices).toHaveLength(5)
      done()
    })

    it('should return the full device list', async done => {
      const devices = await getDevices(null, true)
      expect(devices).toHaveLength(7)
      done()
    })

    it('should return the audioIn device list with kind audioinput', async done => {
      const devices = await getDevices('audioinput')
      expect(devices).toHaveLength(2)
      expect(devices[0].deviceId).toEqual('default')
      done()
    })

    it('should return the video device list with kind videoinput', async done => {
      const devices = await getDevices('videoinput')
      expect(devices).toHaveLength(2)
      expect(devices[0].deviceId).toEqual('2060bf50ab9c29c12598bf4eafeafa71d4837c667c7c172bb4407ec6c5150206')
      done()
    })

    it('should return the audioOut device list with kind audiooutput', async done => {
      const devices = await getDevices('audiooutput')
      expect(devices).toHaveLength(1)
      expect(devices[0].deviceId).toEqual('default')
      done()
    })

    describe('without camera permissions', () => {
      it('should return device list of devices having deviceId', async done => {
        // @ts-ignore
        navigator.mediaDevices.enumerateDevices.mockResolvedValueOnce(DEVICES_CAMERA_NO_LABELS)
        const devices = await getDevices()
        expect(devices).toHaveLength(5)
        expect(devices.every((d: MediaDeviceInfo) => (d.deviceId))).toBe(true)
        done()
      })
    })


    describe('without microphone permissions', () => {
      it('should return device list of devices having deviceId', async done => {
        // @ts-ignore
        navigator.mediaDevices.enumerateDevices.mockResolvedValueOnce(DEVICES_MICROPHONE_NO_LABELS)
        const devices = await getDevices()
        expect(devices).toHaveLength(5)
        expect(devices.every((d: MediaDeviceInfo) => (d.deviceId))).toBe(true)
        done()
      })
    })

  })

  describe('assureDeviceId', () => {

    beforeEach(() => {
      // @ts-ignore
      navigator.mediaDevices.enumerateDevices.mockClear()
    })

    it('should return the deviceId if the device is available', async done => {
      // See setup/browser.ts for these values.
      const deviceId = await assureDeviceId('2060bf50ab9c29c12598bf4eafeafa71d4837c667c7c172bb4407ec6c5150206', 'FaceTime HD Camera', 'videoinput')
      expect(deviceId).toEqual('2060bf50ab9c29c12598bf4eafeafa71d4837c667c7c172bb4407ec6c5150206')
      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledTimes(1)
      done()
    })

    it('should return null if the device is no longer available', async done => {
      const NEW_DEVICE_LIST = [
        { 'deviceId': 'uuid', 'kind': 'videoinput', 'label': 'camera1', 'groupId': '72e8ab9444144c3f8e04276a5801e520e83fc801702a6ef68e9e344083f6f6ce' },
        { 'deviceId': 'uuid', 'kind': 'videoinput', 'label': 'camera2', 'groupId': '67a612f4ac80c6c9854b50d664348e69b5a11421a0ba8d68e2c00f3539992b4c' }
      ]
      // @ts-ignore
      navigator.mediaDevices.enumerateDevices.mockResolvedValue(NEW_DEVICE_LIST)
      const deviceId = await assureDeviceId('2060bf50ab9c29c12598bf4eafeafa71d4837c667c7c172bb4407ec6c5150206', 'FaceTime HD Camera', 'videoinput')
      expect(deviceId).toBeNull()
      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledTimes(1)
      done()
    })

    it('should recognize the device by its label', async done => {
      const NEW_DEVICE_LIST = [
        { 'deviceId': 'uuid', 'kind': 'videoinput', 'label': 'camera1', 'groupId': '72e8ab9444144c3f8e04276a5801e520e83fc801702a6ef68e9e344083f6f6ce' },
        { 'deviceId': 'new-uuid', 'kind': 'videoinput', 'label': 'FaceTime HD Camera', 'groupId': '67a612f4ac80c6c9854b50d664348e69b5a11421a0ba8d68e2c00f3539992b4c' }
      ]
      // @ts-ignore
      navigator.mediaDevices.enumerateDevices.mockResolvedValue(NEW_DEVICE_LIST)
      const deviceId = await assureDeviceId('2060bf50ab9c29c12598bf4eafeafa71d4837c667c7c172bb4407ec6c5150206', 'FaceTime HD Camera', 'videoinput')
      expect(deviceId).toEqual('new-uuid')
      expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalledTimes(1)
      done()
    })

  })

})
