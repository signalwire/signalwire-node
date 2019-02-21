import behaveLikeBaseSession from '../../common/tests/behaveLike/BaseSession'
import { monitorCallbackQueue } from '../../common/src/services/Handler'
import Verto from '../src/Verto'
const Connection = require('../../common/src/services/Connection')

describe('Verto', () => {
  behaveLikeBaseSession.call(this, Verto)

  let instance: Verto
  const noop = (): void => { }

  beforeEach(async done => {
    Connection.mockSend.mockClear()
    Connection.default.mockClear()
    instance = new Verto({ host: 'example.fs.edo', login: 'login', password: 'passwd' })
    instance.subscriptions = {}
    await instance.connect()
    done()
  })

  it('should instantiate Verto with default methods', () => {
    expect(instance).toBeInstanceOf(Verto)
  })

  describe('.validateOptions()', () => {
    it('should return false with invalid options', () => {
      instance.options = { host: 'example.fs.edo', project: 'project', token: 'token' }
      expect(instance.validateOptions()).toEqual(false)
    })

    it('should return false with invalid options', () => {
      instance.options = { host: 'fs.example.com', login: 'login', passwd: '1234' }
      expect(instance.validateOptions()).toEqual(true)

      instance.options = { host: 'fs.example.com', login: 'login', password: '1234' }
      expect(instance.validateOptions()).toEqual(true)
    })
  })

  describe('.connect()', () => {
    it('should instantiate its own connection', () => {
      expect(Connection.default).toHaveBeenCalledTimes(1)
    })

    it('should register socket listeners', () => {
      const listeners = ['signalwire.internal.disconnect', 'signalwire.socket.close', 'signalwire.socket.open', 'signalwire.socket.error', 'signalwire.socket.message']
      const queue = monitorCallbackQueue()
      expect(Object.keys(queue).sort()).toEqual(listeners.sort())
    })

    it('should set the devices object', () => {
      expect(instance.videoDevices).toBeDefined()
      expect(instance.audioInDevices).toBeDefined()
      expect(instance.audioOutDevices).toBeDefined()
    })

    describe('with an already established connection', () => {
      it('should do nothing', async done => {
        await instance.connect()
        expect(Connection.mockClose).not.toHaveBeenCalled()
        const q = monitorCallbackQueue()['signalwire.socket.open'][instance.uuid]
        expect(q).toHaveLength(1)
        done()
      })
    })

    describe('with an invalid connection (closed/closing state)', () => {
      it('should close the previous one and create another', async done => {
        Connection.connected.mockReturnValueOnce(false)
        await instance.connect()
        expect(Connection.mockClose).toHaveBeenCalledTimes(1)
        expect(Connection.default).toHaveBeenCalledTimes(2)
        done()
      })
    })
  })

  describe('.disconnect()', () => {
    it('should close the connection', () => {
      instance.disconnect()
      expect(Connection.mockClose).toHaveBeenCalled()
      expect(instance.dialogs).toMatchObject({})
      expect(instance.subscriptions).toMatchObject({})
    })
  })

  describe('.speedTest()', () => {
    // TODO:
  })

  describe('.subscribe()', () => {
    it('should add the subscription and return the response', async () => {
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":77,"result":{"subscribedChannels":["channel-test-name"],"sessid":"sessid-xyz"}}'))
      const response = await instance.subscribe({ channels: ['channel-test-name'], handler: noop })
      expect(response).toHaveProperty('subscribedChannels')
      expect(response.subscribedChannels).toEqual(['channel-test-name'])
      expect(Connection.mockSend.mock.calls).toHaveLength(1)
      expect(instance.subscriptions).toHaveProperty('channel-test-name')
    })

    it('should do nothing if subscription already exists and return NULL', async () => {
      instance.subscriptions = { 'channel-already-there': {} }
      const response = await instance.subscribe({ channels: ['channel-already-there'], handler: noop })
      expect(response).toBeUndefined()
      expect(Connection.mockSend.mock.calls).toHaveLength(0)
      expect(instance.subscriptions).toHaveProperty('channel-already-there')
    })

    it('should not add the subscription to an invalid channel but return the response', async () => {
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":77,"result":{"unauthorizedChannels":["channel-invalid"],"sessid":"sessid-xyz"}}'))
      const response = await instance.subscribe({ channels: ['channel-invalid'], handler: noop })
      expect(response).toHaveProperty('unauthorizedChannels')
      expect(Connection.mockSend.mock.calls).toHaveLength(1)
      expect(instance.subscriptions).not.toHaveProperty('channel-invalid')
    })
  })

  describe('.unsubscribe()', () => {
    it('should remove the subscription and return the response', async () => {
      const cName = 'channel-already-there'
      instance.subscriptions = { [cName]: {} }
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse(`{"jsonrpc":"2.0","id":77,"result":{"unsubscribedChannels":["${cName}"],"sessid":"sessid-xyz"}}`))
      const response = await instance.unsubscribe({ channels: [cName] })
      expect(response).toHaveProperty('unsubscribedChannels')
      expect(response.unsubscribedChannels).toEqual([cName])
      expect(instance.subscriptions).not.toHaveProperty(cName)
    })

    it('should do nothing if subscription does not exists', async () => {
      const cName = 'channel-fake'
      const response = await instance.unsubscribe({ channels: [cName] })
      expect(response).toBeUndefined()
      expect(instance.subscriptions).not.toHaveProperty(cName)
    })
  })

  describe('.broadcast()', () => {
    it('should broadcast the message with valid params', () => {
      const cName = 'bd-channel'
      instance.subscriptions = { [cName]: {} }
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse(`{"jsonrpc":"2.0","id":77,"result":{"unsubscribedChannels":["${cName}"],"sessid":"sessid-xyz"}}`))
      const response = instance.broadcast({ channel: cName, data: { text: 'msg' } })
      expect(response).toBeUndefined()
      const { request } = Connection.mockSend.mock.calls[0][0]
      expect(request.params).toMatchObject({ sessid: '', eventChannel: cName, data: { text: 'msg' } })
    })

    it('should thrown an error with invalid params', () => {
      expect(instance.broadcast.bind(instance, { channel: '' })).toThrow()
      expect(instance.broadcast.bind(instance, { channel: false })).toThrow()
      expect(instance.broadcast.bind(instance, { channel: null })).toThrow()
    })
  })

  describe('static .uuid()', () => {
    it('generates UUID v4', () => {
      const pattern = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
      expect(Verto.uuid()).toMatch(pattern)
    })
  })

  describe('.mediaConstraints', () => {
    it('should match default constraints', () => {
      const tmp = instance.mediaConstraints
      expect(tmp).toMatchObject({ audio: true, video: false })
      expect(Object.keys(tmp)).toEqual(['audio', 'video'])
    })
  })

  describe('.setAudioSettings()', () => {
    const MIC_ID = 'c3d0a4cb47f5efd7af14c2c3860d12f0199042db6cbdf0c690c38644a24a6ba7'
    const CAM_ID = '2060bf50ab9c29c12598bf4eafeafa71d4837c667c7c172bb4407ec6c5150206'

    it('should throw an error with invalid micId', () => {
      expect(
        instance.setAudioSettings({ micId: CAM_ID, micLabel: 'Random Mic', volume: 1, echoCancellation: false })
      ).rejects.toMatch(/Unknown\ device\ with/)
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

    it('should throw an error with invalid camId', () => {
      expect(
        instance.setVideoSettings({ camId: MIC_ID, camLabel: 'Random cam', width: 1280, height: 720 })
      ).rejects.toMatch(/Unknown\ device\ with/)
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
