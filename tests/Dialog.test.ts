import Verto from '../src/Verto'
import Dialog from '../src/rtc/Dialog'
import { monitorCallbackQueue } from '../src/services/Handler'
import { DialogState } from '../src/util/constants'
const Connection = require('../src/Connection')
jest.mock('../src/Connection')

describe('Dialog', () => {
  let session: Verto
  let dialog: Dialog
  const defaultParams = {
    destinationNumber: 'x3599',
    remoteCallerName: 'Js Client Test',
    remoteCallerNumber: '1234',
    callerName: 'Jest Client',
    callerNumber: '5678',
  }
  const noop = (): void => {}

  beforeEach(() => {
    session = new Verto({ host: 'example.fs.edo', login: 'login', passwd: 'passwd' })
    session.connect()
    dialog = new Dialog(session, defaultParams)
  })

  describe('with required parameters', () => {
    it('should instantiate the default listeners', () => {
      const queue = monitorCallbackQueue()
      expect(Object.keys(queue)).toContain('signalwire.rtc.mediaError')
      expect(queue['signalwire.rtc.mediaError']).toHaveProperty(dialog.id)
      expect(dialog.state).toEqual('new')
      expect(session.dialogs).toHaveProperty(dialog.id)
    })
  })

  describe('specifying an ID', () => {
    it('should use the ID as dialogId', () => {
      dialog = new Dialog(session, { ...defaultParams, id: 'test-id-example' })
      expect(dialog.id).toEqual('test-id-example')
      expect(session.dialogs).toHaveProperty('test-id-example')
    })
  })

  describe('specifying onNotification callback', () => {
    it('should set a listener for the notifications', () => {
      dialog = new Dialog(session, { ...defaultParams, onNotification: noop })
      const queue = monitorCallbackQueue()
      expect(queue['signalwire.notification']).toHaveProperty(dialog.id)
      expect(queue['signalwire.notification'][dialog.id].length).toEqual(1)
    })
  })

  describe('.setState()', () => {
    beforeEach(() => {
      dialog = new Dialog(session, { ...defaultParams, onNotification: noop })
      expect(dialog.state).toEqual('new')
    })

    it('set state to Requesting', () => {
      dialog.setState(DialogState.Requesting)
      expect(dialog.state).toEqual('requesting')
    })

    it('set state to Trying', () => {
      dialog.setState(DialogState.Trying)
      expect(dialog.state).toEqual('trying')
    })

    it('set state to Recovering', () => {
      dialog.setState(DialogState.Recovering)
      expect(dialog.state).toEqual('recovering')
    })

    it('set state to Ringing', () => {
      dialog.setState(DialogState.Ringing)
      expect(dialog.state).toEqual('ringing')
    })

    it('set state to Answering', () => {
      dialog.setState(DialogState.Answering)
      expect(dialog.state).toEqual('answering')
    })

    it('set state to Early', () => {
      dialog.setState(DialogState.Early)
      expect(dialog.state).toEqual('early')
    })

    it('set state to Active', () => {
      dialog.setState(DialogState.Active)
      expect(dialog.state).toEqual('active')
    })

    it('set state to Held', () => {
      dialog.setState(DialogState.Held)
      expect(dialog.state).toEqual('held')
    })

    it('set state to Hangup', () => {
      dialog.setState(DialogState.Hangup)
      expect(dialog.state).toEqual('hangup')
    })

    it('set state to Destroy', () => {
      dialog.setState(DialogState.Destroy)
      expect(dialog.state).toEqual('destroy')
      expect(session.dialogs).not.toHaveProperty(dialog.id)
      const queue = monitorCallbackQueue()
      expect(queue['signalwire.notification']).not.toHaveProperty(dialog.id)
      expect(queue['signalwire.rtc.mediaError']).not.toHaveProperty(dialog.id)
    })

    it('set state to Purge', () => {
      dialog.setState(DialogState.Purge)
      expect(dialog.state).toEqual('destroy')
      expect(session.dialogs).not.toHaveProperty(dialog.id)
      const queue = monitorCallbackQueue()
      expect(queue['signalwire.notification']).not.toHaveProperty(dialog.id)
      expect(queue['signalwire.rtc.mediaError']).not.toHaveProperty(dialog.id)
    })
  })

  describe('.handleConferenceUpdate()', () => {
    const _mockResponse = (mod: boolean = false) => {
      Connection.mockResponse
        .mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":77,"result":{"subscribedChannels":["conference-chat-channel"],"sessid":"sessid-xyz"}}'))
        .mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":77,"result":{"subscribedChannels":["conference-info-channel"],"sessid":"sessid-xyz"}}'))
      if (mod) {
        Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":77,"result":{"subscribedChannels":["conference-mod-channel"],"sessid":"sessid2"}}'))
      }
    }
    const onNotification = jest.fn()
    let pvtData = JSON.parse('{"action":"conference-liveArray-join","laChannel":"conference-liveArray-channel","laName":"3599","role":"participant","chatID":"conf+3599@188.166.44.156","conferenceMemberID":"67","canvasCount":1,"chatChannel":"conference-chat-channel","infoChannel":"conference-info-channel"}')

    beforeEach(() => {
      dialog = new Dialog(session, { ...defaultParams, onNotification })
    })

    describe('on bootObj', () => {
      const packet = JSON.parse('{"action":"bootObj","name":"3599","wireSerno":-1,"data":[["ab077699-540b-c370-fc74-62d5a6d4f300",["0067","email@test.com","Jest client JS","opus@48000","{\\"audio\\":{\\"muted\\":false,\\"deaf\\":false,\\"onHold\\":false,\\"talking\\":false,\\"floor\\":true,\\"energyScore\\":16},\\"video\\":{\\"visible\\":true,\\"videoOnly\\":false,\\"avatarPresented\\":false,\\"mediaFlow\\":\\"sendRecv\\",\\"muted\\":false,\\"floor\\":true,\\"reservationID\\":null,\\"roleID\\":null,\\"videoLayerID\\":1},\\"oldStatus\\":\\"FLOOR VIDEO (FLOOR)\\"}",{"email":"email@test.com","avatar":"avatar"},null]],["3327dda8-b7c6-482c-b692-8f0d8c6d911f",["0069","edoardo@signalwire.com","SW JS client","opus@48000","{\\"audio\\":{\\"muted\\":false,\\"deaf\\":false,\\"onHold\\":false,\\"talking\\":false,\\"floor\\":false,\\"energyScore\\":0},\\"video\\":{\\"visible\\":true,\\"videoOnly\\":false,\\"avatarPresented\\":false,\\"mediaFlow\\":\\"sendRecv\\",\\"muted\\":false,\\"floor\\":false,\\"reservationID\\":null,\\"roleID\\":null,\\"videoLayerID\\":0},\\"oldStatus\\":\\"ACTIVE VIDEO\\"}",{},null]]]}')
      describe('as a moderator', () => {
        it('should setup liveArray', async () => {
          _mockResponse()
          const res = await dialog.handleConferenceUpdate(packet, pvtData)
          const channels = ['conference-chat-channel', 'conference-info-channel']
          expect(Object.keys(session.subscriptions)).toEqual(expect.arrayContaining(channels))
          expect(dialog.channels.sort()).toEqual(channels.sort())
          expect(dialog).toHaveProperty('hangup')
          expect(dialog).toHaveProperty('sendChatMessage')
        })
      })

      describe('as a moderator', () => {
        it('should setup liveArray with modChannel', async () => {
          _mockResponse(true)
          pvtData = JSON.parse('{"action":"conference-liveArray-join","laChannel":"conference-liveArray-channel","laName":"3599","role":"moderator","chatID":"conf+3599@188.166.44.156","conferenceMemberID":"80","canvasCount":1,"modChannel":"conference-mod-channel","chatChannel":"conference-chat-channel","infoChannel":"conference-info-channel"}')
          const res = await dialog.handleConferenceUpdate(packet, pvtData)
          const channels = ['conference-chat-channel', 'conference-info-channel', 'conference-mod-channel']
          expect(Object.keys(session.subscriptions)).toEqual(expect.arrayContaining(channels))
          expect(dialog.channels.sort()).toEqual(channels.sort())
          expect(dialog).toHaveProperty('sendChatMessage')
          expect(dialog).toHaveProperty('kick')
          expect(dialog).toHaveProperty('listVideoLayouts')
          expect(dialog.role).toEqual('moderator')
        })
      })
    })

    // describe('on add', () => {
    //   const packet = JSON.parse('{"action":"add","arrIndex":1,"name":"3599","hashKey":"f9ea4d7e-d55e-7dce-0cc2-ae48ec33abce","wireSerno":6,"data":["0083","email@test.com","Jest client JS","opus@48000","{\\"audio\\":{\\"muted\\":false,\\"deaf\\":false,\\"onHold\\":false,\\"talking\\":false,\\"floor\\":false,\\"energyScore\\":0},\\"video\\":{\\"visible\\":false,\\"videoOnly\\":false,\\"avatarPresented\\":false,\\"mediaFlow\\":\\"sendRecv\\",\\"muted\\":false,\\"floor\\":false,\\"reservationID\\":null,\\"roleID\\":null,\\"videoLayerID\\":-1},\\"oldStatus\\":\\"ACTIVE VIDEO\\"}",{"email":"email@test.com","avatar":"avatar"},null]}')
    //   it('should do something', async () => {
    //     const res = await dialog.handleConferenceUpdate(packet, pvtData)
    //     console.log(res)
    //     // expect(dialog.__onNotification.mock).toHaveBeenCalledTimes(1)
    //   })
    // })

    // describe('on modify', () => {
    //   const packet = JSON.parse('{"action":"modify","name":"3599","hashKey":"26c237dd-8995-1a71-96cc-11cd737659c2","wireSerno":24,"data":["0080","email@test.com","Jest client JS","opus@48000","{\\"audio\\":{\\"muted\\":false,\\"deaf\\":false,\\"onHold\\":false,\\"talking\\":true,\\"floor\\":true,\\"energyScore\\":633},\\"video\\":{\\"visible\\":true,\\"videoOnly\\":false,\\"avatarPresented\\":false,\\"mediaFlow\\":\\"sendRecv\\",\\"muted\\":false,\\"floor\\":true,\\"reservationID\\":null,\\"roleID\\":null,\\"videoLayerID\\":0},\\"oldStatus\\":\\"TALKING (FLOOR) VIDEO (FLOOR)\\"}",{"email":"email@test.com","avatar":"avatar"},null]}')
    //   it('should do something', async () => {
    //     const res = await dialog.handleConferenceUpdate(packet, pvtData)
    //     console.log(res)
    //     // expect(dialog.__onNotification.mock).toHaveBeenCalledTimes(1)
    //   })
    // })

    // describe('on del', () => {
    //   const packet = JSON.parse('{"name":"3599","action":"del","hashKey":"f9ea4d7e-d55e-7dce-0cc2-ae48ec33abce","wireSerno":11,"data":["0083","email@test.com","Jest client JS","opus@48000","{\\"audio\\":{\\"muted\\":false,\\"deaf\\":false,\\"onHold\\":false,\\"talking\\":false,\\"floor\\":false,\\"energyScore\\":0},\\"video\\":{\\"visible\\":false,\\"videoOnly\\":false,\\"avatarPresented\\":false,\\"mediaFlow\\":\\"sendRecv\\",\\"muted\\":false,\\"floor\\":false,\\"reservationID\\":null,\\"roleID\\":null,\\"videoLayerID\\":-1},\\"oldStatus\\":\\"ACTIVE VIDEO\\"}",{"email":"email@test.com","avatar":"avatar"},null]}')
    //   it('should do something', async () => {
    //     const res = await dialog.handleConferenceUpdate(packet, pvtData)
    //     console.log(res)
    //     // expect(dialog.__onNotification.mock).toHaveBeenCalledTimes(1)
    //   })
    // })

    // describe('on clear', () => {
    //   const packet = JSON.parse('')
    //   it('should do something', async () => {
    //     const res = await dialog.handleConferenceUpdate(packet, pvtData)
    //     expect(onNotification.mock).toHaveBeenCalledTimes(1)
    //   })
    // })
  })

  describe('.hold()', () => {
    it('should change the dialog state', async () => {
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"3a42b89f-3c37-4e5f-874f-ac8a9c021c9d","result":{"callID":"f5552e28-405a-4ebc-93f3-355b01e2df4e","action":"hold","holdState":"held","sessid":"sessid"}}'))
      await dialog.hold()
      expect(dialog.state).toEqual('held')
    })
  })

  describe('.unhold()', () => {
    it('should change the dialog state', async () => {
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"a8dcd71d-d473-4d43-b517-87b175ba7ed7","result":{"callID":"f5552e28-405a-4ebc-93f3-355b01e2df4e","action":"unhold","holdState":"active","sessid":"sessid"}}'))
      await dialog.unhold()
      expect(dialog.state).toEqual('active')
    })
  })

  describe('.toggleHold()', () => {
    it('should change the dialog state', async () => {
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"61a9d32b-d241-40d1-87b0-0d8384936ae8","result":{"callID":"f5552e28-405a-4ebc-93f3-355b01e2df4e","action":"toggleHold","holdState":"held","sessid":"sessid"}}'))
      await dialog.toggleHold()
      expect(dialog.state).toEqual('held')

      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"a8dcd71d-d473-4d43-b517-87b175ba7ed7","result":{"callID":"f5552e28-405a-4ebc-93f3-355b01e2df4e","action":"toggleHold","holdState":"active","sessid":"sessid"}}'))
      await dialog.toggleHold()
      expect(dialog.state).toEqual('active')
    })
  })

  describe('.hangup()', () => {
    describe('with params and execute true', () => {
      it('should change the dialog state', () => {
        Connection.mockSend.mockClear()
        dialog.hangup({ cause: 'T01', causeCode: 'Test01' })
        expect(dialog.state).toEqual('hangup')
        expect(dialog.cause).toEqual('T01')
        expect(dialog.causeCode).toEqual('Test01')
        expect(Connection.mockSend).toHaveBeenCalledTimes(1)
      })
    })

    describe('with params and execute false', () => {
      it('should set the state to destroy without execute', () => {
        Connection.mockSend.mockClear()
        dialog.hangup({ cause: 'T01', causeCode: 'Test01' }, false)
        expect(dialog.state).toEqual('destroy')
        expect(dialog.cause).toEqual('T01')
        expect(dialog.causeCode).toEqual('Test01')
        expect(Connection.mockSend).not.toHaveBeenCalled()
      })
    })
  })
})
