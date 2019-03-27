import { isQueued } from '../../../common/src/services/Handler'
import { State } from '../../../common/src/util/constants/dialog'
import Dialog from '../../src/webrtc/Dialog'
import Verto from '../../../web/src/Verto'
const Connection = require('../../../common/src/services/Connection')

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

  beforeEach(async done => {
    session = new Verto({ host: 'example.fs.edo', login: 'login', passwd: 'passwd' })
    await session.connect()
    dialog = new Dialog(session, defaultParams)
    done()
  })

  describe('with required parameters', () => {
    it('should instantiate the default listeners', () => {
      expect(isQueued('signalwire.rtc.mediaError', dialog.id)).toEqual(true)
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
      expect(isQueued('signalwire.notification', dialog.id)).toEqual(true)
    })
  })

  describe('.setState()', () => {
    beforeEach(() => {
      dialog = new Dialog(session, { ...defaultParams, onNotification: noop })
      expect(dialog.prevState).toEqual(dialog.state)
    })

    it('set state to Requesting', () => {
      dialog.setState(State.Requesting)
      expect(dialog.state).toEqual('requesting')
    })

    it('set state to Trying', () => {
      dialog.setState(State.Trying)
      expect(dialog.state).toEqual('trying')
    })

    it('set state to Recovering', () => {
      dialog.setState(State.Recovering)
      expect(dialog.state).toEqual('recovering')
    })

    it('set state to Ringing', () => {
      dialog.setState(State.Ringing)
      expect(dialog.state).toEqual('ringing')
    })

    it('set state to Answering', () => {
      dialog.setState(State.Answering)
      expect(dialog.state).toEqual('answering')
    })

    it('set state to Early', () => {
      dialog.setState(State.Early)
      expect(dialog.state).toEqual('early')
    })

    it('set state to Active', () => {
      dialog.setState(State.Active)
      expect(dialog.state).toEqual('active')
    })

    it('set state to Held', () => {
      dialog.setState(State.Held)
      expect(dialog.state).toEqual('held')
    })

    it('set state to Hangup', () => {
      dialog.setState(State.Hangup)
      expect(dialog.state).toEqual('hangup')
    })

    it('set state to Destroy', () => {
      dialog.setState(State.Destroy)
      expect(dialog.state).toEqual('destroy')
      expect(session.dialogs).not.toHaveProperty(dialog.id)
      expect(isQueued('signalwire.rtc.mediaError', dialog.id)).toEqual(false)

    })

    it('set state to Purge', () => {
      dialog.setState(State.Purge)
      expect(dialog.state).toEqual('destroy')
      expect(session.dialogs).not.toHaveProperty(dialog.id)
      expect(isQueued('signalwire.rtc.mediaError', dialog.id)).toEqual(false)
    })

    it('set prevState', () => {
      dialog.setState(State.Ringing)
      expect(dialog.prevState).toEqual('new')
      dialog.setState(State.Active)
      expect(dialog.prevState).toEqual('ringing')
      dialog.setState(State.Hangup)
      expect(dialog.prevState).toEqual('active')
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
      it('should setup liveArray as a participant', async done => {
        _mockResponse()
        await dialog.handleConferenceUpdate(packet, pvtData)
        const channels = ['conference-chat-channel', 'conference-info-channel']
        const subs = Object.keys(session.subscriptions[session.webRtcProtocol])
        expect(subs).toEqual(expect.arrayContaining(channels))
        expect(dialog.channels.sort()).toEqual(channels.sort())
        expect(dialog).toHaveProperty('hangup')
        expect(dialog).toHaveProperty('sendChatMessage')
        done()
      })

      it('should setup liveArray as a moderator with modChannel', async done => {
        _mockResponse(true)
        pvtData = JSON.parse('{"action":"conference-liveArray-join","laChannel":"conference-liveArray-channel","laName":"3599","role":"moderator","chatID":"conf+3599@188.166.44.156","conferenceMemberID":"80","canvasCount":1,"modChannel":"conference-mod-channel","chatChannel":"conference-chat-channel","infoChannel":"conference-info-channel"}')
        await dialog.handleConferenceUpdate(packet, pvtData)
        const channels = ['conference-chat-channel', 'conference-info-channel', 'conference-mod-channel']
        const subs = Object.keys(session.subscriptions[session.webRtcProtocol])
        expect(subs).toEqual(expect.arrayContaining(channels))
        expect(dialog.channels.sort()).toEqual(channels.sort())
        expect(dialog).toHaveProperty('sendChatMessage')
        expect(dialog).toHaveProperty('kick')
        expect(dialog).toHaveProperty('listVideoLayouts')
        expect(dialog.role).toEqual('moderator')
        done()
      })
    })

    describe('on add', () => {
      const packet = JSON.parse('{"action":"add","arrIndex":1,"name":"3599","hashKey":"19e4f1b5-17a9-9456-b117-57f6bb114ce3","wireSerno":8,"data":["0069","1011","User","opus@48000","{\\"audio\\":{\\"muted\\":false,\\"deaf\\":false,\\"onHold\\":false,\\"talking\\":false,\\"floor\\":false,\\"energyScore\\":0},\\"video\\":{\\"visible\\":false,\\"videoOnly\\":false,\\"avatarPresented\\":false,\\"mediaFlow\\":\\"sendRecv\\",\\"muted\\":false,\\"floor\\":false,\\"reservationID\\":null,\\"videoLayerID\\":-1},\\"oldStatus\\":\\"ACTIVE VIDEO\\"}",{},null]}')
      it('should dispatch a structured notification', async done => {
        await dialog.handleConferenceUpdate(packet, pvtData)
        expect(onNotification).toHaveBeenLastCalledWith({
          type: 'conferenceUpdate',
          dialog,
          action: 'add',
          callId: '19e4f1b5-17a9-9456-b117-57f6bb114ce3',
          index: 1,
          participantId: 69,
          participantNumber: '1011',
          participantName: 'User',
          codec: 'opus@48000',
          media: {
            audio: { deaf: false, energyScore: 0, floor: false, muted: false, onHold: false, talking: false },
            video: { avatarPresented: false, floor: false, mediaFlow: 'sendRecv', muted: false, reservationId: null, videoLayerId: -1, videoOnly: false, visible: false },
            oldStatus: 'ACTIVE VIDEO'
          },
          participantData: {}
        })
        done()
      })
    })

    describe('on modify', () => {
      const packet = JSON.parse('{"action":"modify","name":"3599","hashKey":"255c02a2-7387-a25e-7862-bdfccfee8c4e","wireSerno":6,"data":["0068","1011","User","opus@48000","{\\"audio\\":{\\"muted\\":false,\\"deaf\\":false,\\"onHold\\":false,\\"talking\\":true,\\"floor\\":true,\\"energyScore\\":736},\\"video\\":{\\"visible\\":true,\\"videoOnly\\":false,\\"avatarPresented\\":false,\\"mediaFlow\\":\\"sendRecv\\",\\"muted\\":false,\\"floor\\":true,\\"floorLocked\\":true,\\"reservationID\\":null,\\"videoLayerID\\":0},\\"oldStatus\\":\\"TALKING (FLOOR) VIDEO (FLOOR)\\"}",{},null]}')
      it('should dispatch a structured notification', async done => {
        await dialog.handleConferenceUpdate(packet, pvtData)
        expect(onNotification).toHaveBeenLastCalledWith({
          type: 'conferenceUpdate',
          dialog,
          action: 'modify',
          callId: '255c02a2-7387-a25e-7862-bdfccfee8c4e',
          index: undefined,
          participantId: 68,
          participantNumber: '1011',
          participantName: 'User',
          codec: 'opus@48000',
          media: {
            audio: { deaf: false, energyScore: 736, floor: true, muted: false, onHold: false, talking: true },
            video: { avatarPresented: false, floor: true, floorLocked: true, mediaFlow: 'sendRecv', muted: false, reservationId: null, videoLayerId: 0, videoOnly: false, visible: true },
            oldStatus: 'TALKING (FLOOR) VIDEO (FLOOR)'
          },
          participantData: {}
        })
        done()
      })
    })

    describe('on del', () => {
      const packet = JSON.parse('{"name":"3599","action":"del","hashKey":"f9ea4d7e-d55e-7dce-0cc2-ae48ec33abce","wireSerno":11,"data":["0083","email@test.com","Jest client JS","opus@48000","{\\"audio\\":{\\"muted\\":false,\\"deaf\\":false,\\"onHold\\":false,\\"talking\\":false,\\"floor\\":false,\\"energyScore\\":0},\\"video\\":{\\"visible\\":false,\\"videoOnly\\":false,\\"avatarPresented\\":false,\\"mediaFlow\\":\\"sendRecv\\",\\"muted\\":false,\\"floor\\":false,\\"reservationID\\":null,\\"roleID\\":null,\\"videoLayerID\\":-1},\\"oldStatus\\":\\"ACTIVE VIDEO\\"}",{"email":"email@test.com","avatar":"avatar"},null]}')
      it('should do something', async done => {
        await dialog.handleConferenceUpdate(packet, pvtData)
        expect(onNotification).toHaveBeenLastCalledWith({
          type: 'conferenceUpdate',
          dialog,
          action: 'delete',
          callId: 'f9ea4d7e-d55e-7dce-0cc2-ae48ec33abce',
          index: undefined,
          participantId: 83,
          participantNumber: 'email@test.com',
          participantName: 'Jest client JS',
          codec: 'opus@48000',
          media: {
            audio: { deaf: false, energyScore: 0, floor: false, muted: false, onHold: false, talking: false },
            video: { avatarPresented: false, floor: false, mediaFlow: 'sendRecv', muted: false, reservationId: null, videoLayerId: -1, videoOnly: false, visible: false, roleId: null },
            oldStatus: 'ACTIVE VIDEO'
          },
          participantData: {
            avatar: 'avatar',
            email: 'email@test.com'
          }
        })
        done()
      })
    })

    describe('on clear', () => {
      const packet = JSON.parse('{"action":"clear","name":"3599","wireSerno":-1,"data":{}}')
      it('should dispatch a very simple notification', async done => {
        await dialog.handleConferenceUpdate(packet, pvtData)
        expect(onNotification).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'conferenceUpdate', action: 'clear', dialog }))
        done()
      })
    })
  })

  describe('.hold()', () => {
    it('should change the dialog state', async done => {
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"3a42b89f-3c37-4e5f-874f-ac8a9c021c9d","result":{"callID":"f5552e28-405a-4ebc-93f3-355b01e2df4e","action":"hold","holdState":"held","sessid":"sessid"}}'))
      await dialog.hold()
      expect(dialog.state).toEqual('held')
      done()
    })
  })

  describe('.unhold()', () => {
    it('should change the dialog state', async done => {
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"a8dcd71d-d473-4d43-b517-87b175ba7ed7","result":{"callID":"f5552e28-405a-4ebc-93f3-355b01e2df4e","action":"unhold","holdState":"active","sessid":"sessid"}}'))
      await dialog.unhold()
      expect(dialog.state).toEqual('active')
      done()
    })
  })

  describe('.toggleHold()', () => {
    it('should change the dialog state', async done => {
      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"61a9d32b-d241-40d1-87b0-0d8384936ae8","result":{"callID":"f5552e28-405a-4ebc-93f3-355b01e2df4e","action":"toggleHold","holdState":"held","sessid":"sessid"}}'))
      await dialog.toggleHold()
      expect(dialog.state).toEqual('held')

      Connection.mockResponse.mockImplementationOnce(() => JSON.parse('{"jsonrpc":"2.0","id":"a8dcd71d-d473-4d43-b517-87b175ba7ed7","result":{"callID":"f5552e28-405a-4ebc-93f3-355b01e2df4e","action":"toggleHold","holdState":"active","sessid":"sessid"}}'))
      await dialog.toggleHold()
      expect(dialog.state).toEqual('active')
      done()
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
