const Connection = require('../../src/services/Connection')

export default (instance: any) => {
  describe('Inherit BrowserSession', () => {

    beforeEach(() => {
      instance._idle = false
      instance._executeQueue = []
      instance.subscriptions = {}
      Connection.mockSend.mockClear()
      Connection.mockSendRawText.mockClear()
    })

    describe('.mediaConstraints', () => {
      it('should match default constraints', () => {
        const tmp = instance.mediaConstraints
        expect(tmp).toMatchObject({ audio: true, video: false })
        expect(Object.keys(tmp)).toEqual(['audio', 'video'])
      })
    })

    describe('.checkPermissions()', () => {

      beforeEach(() => {
        // @ts-ignore
        navigator.mediaDevices.getUserMedia.mockClear()
      })

      it('should check both audio and video by default', async () => {
        const result = await instance.checkPermissions()
        expect(result).toBe(true)
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1)
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true, video: true })
      })

      it('should check only video', async () => {
        const result = await instance.checkPermissions(false, true)
        expect(result).toBe(true)
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1)
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: false, video: true })
      })

      it('should check only audio', async () => {
        const result = await instance.checkPermissions(true, false)
        expect(result).toBe(true)
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1)
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true, video: false })
      })

      it('should return false in case of error', async () => {
        // @ts-ignore
        navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(new Error('Perms error'))
        const result = await instance.checkPermissions()
        expect(result).toBe(false)
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1)
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true, video: true })
      })
    })

    describe('.setAudioSettings()', () => {
      const MIC_ID = 'c3d0a4cb47f5efd7af14c2c3860d12f0199042db6cbdf0c690c38644a24a6ba7'
      const CAM_ID = '2060bf50ab9c29c12598bf4eafeafa71d4837c667c7c172bb4407ec6c5150206'

      it('should not set deviceId with an invalid micId', () => {
        expect(
          instance.setAudioSettings({ micId: CAM_ID, micLabel: 'Random Mic', volume: 1, echoCancellation: false })
        ).resolves.toMatchObject({ volume: 1, echoCancellation: false })
      })

      it('should set deviceId', () => {
        expect(
          instance.setAudioSettings({ micId: MIC_ID, micLabel: 'Random Mic', volume: 1, echoCancellation: false })
        ).resolves.toMatchObject({ deviceId: { exact: MIC_ID }, volume: 1, echoCancellation: false })
      })

      it('should remove unsupported audio constraints', () => {
        expect(
          // @ts-ignore
          instance.setAudioSettings({ micId: MIC_ID, micLabel: 'Random Mic', volumex: 1, echoCancellationFake: false })
        ).resolves.toMatchObject({ deviceId: { exact: MIC_ID } })
      })
    })

    describe('.setVideoSettings()', () => {
      const MIC_ID = 'c3d0a4cb47f5efd7af14c2c3860d12f0199042db6cbdf0c690c38644a24a6ba7'
      const CAM_ID = '2060bf50ab9c29c12598bf4eafeafa71d4837c667c7c172bb4407ec6c5150206'

      it('should not set deviceId with an invalid camId', () => {
        expect(
          instance.setVideoSettings({ camId: MIC_ID, camLabel: 'Random cam', width: 1280, height: 720 })
        ).resolves.toMatchObject({ width: 1280, height: 720 })
      })

      it('should set deviceId', () => {
        expect(
          instance.setVideoSettings({ camId: CAM_ID, camLabel: 'Random cam', width: 1280, height: 720 })
        ).resolves.toMatchObject({ deviceId: { exact: CAM_ID }, width: 1280, height: 720 })
      })

      it('should remove unsupported audio constraints', () => {
        expect(
          // @ts-ignore
          instance.setVideoSettings({ camId: CAM_ID, camLabel: 'Random cam', widh: 1280, higt: 720 })
        ).resolves.toMatchObject({ deviceId: { exact: CAM_ID } })
      })
    })

    describe('.disableMicrophone()', () => {
      it('should set audio constraint to false', () => {
        instance.disableMicrophone()
        expect(instance.mediaConstraints.audio).toEqual(false)
      })
    })

    describe('.enableMicrophone()', () => {
      it('should set audio constraint to true', () => {
        instance.enableMicrophone()
        expect(instance.mediaConstraints.audio).toEqual(true)
      })
    })

    describe('.disableWebcam()', () => {
      it('should set video constraint to false', () => {
        instance.disableWebcam()
        expect(instance.mediaConstraints.video).toEqual(false)
      })
    })

    describe('.enableWebcam()', () => {
      it('should set video constraint to true', () => {
        instance.enableWebcam()
        expect(instance.mediaConstraints.video).toEqual(true)
      })
    })
  })
}
