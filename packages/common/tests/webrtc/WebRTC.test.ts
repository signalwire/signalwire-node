import {
  RTCPeerConnection,
  getUserMedia,
  getDisplayMedia,
  enumerateDevices,
  getSupportedConstraints,
  WebRTCOverridesManager,
  streamIsValid,
} from '../../src/webrtc/WebRTC'
import * as WebRTC from '../../src/util/webrtc'

jest.mock('../../src/util/webrtc', () => ({
  RTCPeerConnection: jest.fn().mockReturnValue({
    getSenders: jest.fn(),
    addTrack: jest.fn(),
  }),
  getUserMedia: jest.fn(),
  getDisplayMedia: jest.fn(),
  enumerateDevices: jest.fn(),
  getSupportedConstraints: jest.fn(),
  attachMediaStream: jest.fn(),
  detachMediaStream: jest.fn(),
  muteMediaElement: jest.fn(),
  unmuteMediaElement: jest.fn(),
  toggleMuteMediaElement: jest.fn(),
  setMediaElementSinkId: jest.fn(),
  sdpToJsonHack: jest.fn(),
  stopStream: jest.fn(),
  streamIsValid: jest.fn(),
}))

describe('WebRTC Module', () => {
  const getSendersAsync = jest.fn()
  const addTrackAsync = jest.fn()

  const _RTCPeerConnection = jest.fn().mockReturnValue({
    addTrack: jest.fn(),
    getSenders: jest.fn(),
    getSendersAsync,
    addTrackAsync,
  })
  const _enumerateDevices = jest.fn()
  const _getDisplayMedia = jest.fn()
  const _getUserMedia = jest.fn()
  const _getSupportedConstraints = jest.fn()
  const _streamIsValid = jest.fn()

  describe('With overrides', () => {
    beforeAll(() => {
      WebRTCOverridesManager.getInstance().RTCPeerConnection =
        _RTCPeerConnection
      WebRTCOverridesManager.getInstance().enumerateDevices = _enumerateDevices
      WebRTCOverridesManager.getInstance().getDisplayMedia = _getDisplayMedia
      WebRTCOverridesManager.getInstance().getUserMedia = _getUserMedia
      WebRTCOverridesManager.getInstance().getSupportedConstraints =
        _getSupportedConstraints
      WebRTCOverridesManager.getInstance().streamIsValid = _streamIsValid
    })

    afterAll(() => {
      //@ts-ignore
      WebRTCOverridesManager.getInstance().RTCPeerConnection = undefined
      //@ts-ignore
      WebRTCOverridesManager.getInstance().enumerateDevices = undefined
      //@ts-ignore
      WebRTCOverridesManager.getInstance().getDisplayMedia = undefined
      //@ts-ignore
      WebRTCOverridesManager.getInstance().getUserMedia = undefined
      //@ts-ignore
      WebRTCOverridesManager.getInstance().getSupportedConstraints = undefined
      //@ts-ignore
      WebRTCOverridesManager.getInstance().streamIsValid = undefined
    })

    it('should call RTCPeerConnection with correct parameters', async () => {
      const mockParams = {iceServers: []}
      const peerConnectionInstance = RTCPeerConnection(mockParams)
      expect(_RTCPeerConnection).toHaveBeenCalledWith(mockParams)
      //@ts-ignore
      await peerConnectionInstance.addTrack({})
      expect(addTrackAsync).toBeCalled()
      await peerConnectionInstance.getSenders()
      expect(getSendersAsync).toBeCalled()
    })

    it('should call getUserMedia with correct parameters', () => {
      const mockParams = {video: true}
      getUserMedia(mockParams)
      expect(_getUserMedia).toHaveBeenCalledWith(mockParams)
    })

    it('should call getDisplayMedia with correct parameters', () => {
      const mockParams = {video: true}
      getDisplayMedia(mockParams)
      expect(_getDisplayMedia).toHaveBeenCalledWith(mockParams)
    })

    it('should call enumerateDevices', () => {
      enumerateDevices()
      expect(_enumerateDevices).toHaveBeenCalled()
    })

    it('should call getSupportedConstraints', () => {
      getSupportedConstraints()
      expect(_getSupportedConstraints).toHaveBeenCalled()
    })

    it('should call getSupportedConstraints', () => {
      streamIsValid({})
      expect(_streamIsValid).toHaveBeenCalled()
    })
  })

  describe('No override', () => {
    it('should call RTCPeerConnection with correct parameters', () => {
      const mockParams = {iceServers: []}
      RTCPeerConnection(mockParams)
      expect(WebRTC.RTCPeerConnection).toHaveBeenCalledWith(mockParams)
    })

    it('should call getUserMedia with correct parameters', () => {
      const mockParams = {video: true}
      getUserMedia(mockParams)
      expect(WebRTC.getUserMedia).toHaveBeenCalledWith(mockParams)
    })

    it('should call getDisplayMedia with correct parameters', () => {
      const mockParams = {video: true}
      getDisplayMedia(mockParams)
      expect(WebRTC.getDisplayMedia).toHaveBeenCalledWith(mockParams)
    })

    it('should call enumerateDevices', () => {
      enumerateDevices()
      expect(WebRTC.enumerateDevices).toHaveBeenCalled()
    })

    it('should call getSupportedConstraints', () => {
      getSupportedConstraints()
      expect(WebRTC.getSupportedConstraints).toHaveBeenCalled()
    })
  })
})
