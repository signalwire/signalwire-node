import Call from './Call'
import { Notification, ConferenceAction } from './constants'
import Conference from './Conference'
import { Subscribe, Broadcast, Unsubscribe } from '../messages/Verto'
import { isQueued, trigger } from '../services/Handler'
import { mutateCanvasInfoData } from './helpers'
const Connection = require('../../../common/src/services/Connection')

jest.unmock('./Conference')

export default (instance: any) => {
  describe('Conference', () => {
    let call: Call
    const onNotification = jest.fn()
    const callID = 'e2fda6dc-fc9d-4d77-8096-53bb502443b6'
    const channels = [
      'conference-liveArray.3594@cantina.freeswitch.org',
      'conference-chat.3594@cantina.freeswitch.org',
      'conference-info.3594@cantina.freeswitch.org',
      'conference-mod.3594@cantina.freeswitch.org',
    ]

    beforeEach(() => {
      call = new Call(instance, { id: callID, destinationNumber: 'x3599', remoteCallerName: 'Js Client Test', remoteCallerNumber: '1234', callerName: 'Jest Client', callerNumber: '5678' })
      call.conference = new Conference(instance)
      instance.on('signalwire.notification', onNotification)
      onNotification.mockClear()
    })

    afterEach(() => {
      instance.off('signalwire.notification')
    })

    const expectChannelsToHaveBeenQueued = (check: boolean) => {
      for (const channel of channels) {
        expect(isQueued(channel)).toEqual(check)
      }
    }

    describe('handle inbound verto events', () => {
      const media = {
        audio: { muted: false, deaf: false, onHold: false, talking: true, floor: true, energyScore: 681 },
        video: { visible: false, videoOnly: false, avatarPresented: false, mediaFlow: 'sendRecv', muted: false, floor: true, reservationId: null, roleId: null, videoLayerId: -1, canvasId: 0, watchingCanvasId: 0 },
        oldStatus: 'old-status'
      }
      const mediaJsonString = JSON.stringify(media).replace(/"/g, '\\"')
      const partialNotification = {
        type: Notification.ConferenceUpdate,
        callId: callID,
        participantId: '0843',
        participantNumber: 'example@domain.com',
        participantName: 'Joe',
        codec: 'opus@48000',
        ...media,
        participantData: {
          email: 'example@domain.com'
        }
      }

      beforeEach(async () => {
        const pvtData = JSON.parse(`{"callID":"${callID}","action":"conference-liveArray-join","laChannel":"${channels[0]}","laName":"3594","role":"moderator","chatID":"conf+3594@cantina.freeswitch.org","conferenceMemberID":"455","canvasCount":1,"modChannel":"${channels[3]}","chatChannel":"${channels[1]}","infoChannel":"${channels[2]}"}`)
        Connection.mockResponse.mockImplementationOnce(() => JSON.parse(`{"jsonrpc":"2.0","id":77,"result":{"subscribedChannels":${JSON.stringify(channels)},"sessid":"sessid-xyz"}}`))
        await call.conference.join(pvtData)
        onNotification.mockClear()
      })

      it('should handle the bootObj event', async () => {
        const params = JSON.parse(`{"data":{"action":"bootObj","name":"3598","wireSerno":-1,"data":[["${callID}",["0843","example@domain.com","Joe","opus@48000","${mediaJsonString}",{"email":"example@domain.com"},null]]]},"eventChannel":"conference-liveArray.3598@cantina.freeswitch.org","sessid":"b72b1e7c-47fd-4202-b615-376a86dfdc8b","eventSerno":0}`)
        trigger(channels[0], params)
        const participants = [
          {
            callId: callID,
            participantId: '0843',
            participantNumber: 'example@domain.com',
            participantName: 'Joe',
            codec: 'opus@48000',
            ...media,
            participantData: {
              email: 'example@domain.com'
            }
          }
        ]
        const notif = { type: Notification.ConferenceUpdate, action: ConferenceAction.Bootstrap, call, participants }
        expect(onNotification).toBeCalledWith(notif)
      })

      it('should handle the add participant event', async () => {
        const params = JSON.parse(`{"data":{"action":"add","arrIndex":1,"name":"3598","hashKey":"${callID}","wireSerno":11,"data":["0843","example@domain.com","Joe","opus@48000","${mediaJsonString}",{"email":"example@domain.com"},null]},"eventChannel":"conference-liveArray.3598@cantina.freeswitch.org","eventSerno":6}`)
        trigger(channels[0], params)
        const notif = {
          ...partialNotification,
          call,
          action: ConferenceAction.Add
        }
        expect(onNotification).toBeCalledWith(notif)
      })

      it('should handle the modify participant event', async () => {
        const params = JSON.parse(`{"data":{"action":"modify","name":"3598","hashKey":"${callID}","wireSerno":8,"data":["0843","example@domain.com","Joe","opus@48000","${mediaJsonString}",{"email":"example@domain.com"},null]},"eventChannel":"conference-liveArray.3598@cantina.freeswitch.org","eventSerno":3}`)
        trigger(channels[0], params)
        const notif = {
          ...partialNotification,
          call,
          action: ConferenceAction.Modify
        }
        expect(onNotification).toBeCalledWith(notif)
      })

      it('should handle the del participant event', async () => {
        const params = JSON.parse(`{"data":{"name":"3598","action":"del","hashKey":"${callID}","wireSerno":8,"data":["0843","example@domain.com","Joe","opus@48000","${mediaJsonString}",{"email":"example@domain.com"},null]},"eventChannel":"conference-liveArray.3599@cantina.freeswitch.org","eventSerno":4}`)
        trigger(channels[0], params)
        const notif = {
          ...partialNotification,
          call,
          action: ConferenceAction.Delete
        }
        expect(onNotification).toBeCalledWith(notif)
      })

      it('should handle the clear event', async () => {
        const params = JSON.parse(`{"data":{"action":"clear","name":"3599","wireSerno":-1,"data":{}},"eventChannel":"conference-liveArray.3599@cantina.freeswitch.org","eventSerno":4}`)
        trigger(channels[0], params)
        const notif = {
          type: Notification.ConferenceUpdate,
          action: ConferenceAction.Clear,
          call,
        }
        expect(onNotification).toBeCalledWith(notif)
      })

      it('should handle chat events', async () => {
        const params = JSON.parse('{"data":{"direction":"outbound","message":"hi","fromDisplay":"Joe","from":"1008","type":"message"},"eventChannel":"conference-chat.3599@cantina.freeswitch.org","eventSerno":9}')
        trigger(channels[1], params)
        const notif = { type: Notification.ConferenceUpdate, action: ConferenceAction.ChatMessage, call, direction: 'outbound', participantNumber: '1008', participantName: 'Joe', messageText: 'hi', messageType: 'message', messageId: 9 }
        expect(onNotification).toBeCalledWith(notif)
      })

    })

    describe('Join', () => {
      const pvtData = JSON.parse(`{"callID":"${callID}","action":"conference-liveArray-join","laChannel":"${channels[0]}","laName":"3594","role":"moderator","chatID":"conf+3594@cantina.freeswitch.org","conferenceMemberID":"455","canvasCount":1,"modChannel":"${channels[3]}","chatChannel":"${channels[1]}","infoChannel":"${channels[2]}"}`)

      it('should set the extension on the Call', () => {
        call.conference.join(pvtData)
        expect(call.extension).toBe('3594')
      })

      it('should dispatch a ConferenceUpdate join notification', () => {
        call.conference.join(pvtData)
        expect(onNotification).toBeCalledWith({ type: Notification.ConferenceUpdate, action: ConferenceAction.Join, call, conferenceName: '3594', participantId: '455', role: 'moderator' })
      })

      it('should execute the verto.subscribe with all channels', async () => {
        Connection.mockResponse.mockImplementationOnce(() => JSON.parse(`{"jsonrpc":"2.0","id":77,"result":{"subscribedChannels":${JSON.stringify(channels)},"sessid":"sessid-xyz"}}`))
        await call.conference.join(pvtData)
        expect(Connection.mockSend).toHaveBeenCalledTimes(2)
        const subscribe = instance._wrapInExecute(new Subscribe({ sessid: instance.sessionid, eventChannel: channels }))
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, subscribe)
        const broadcast = instance._wrapInExecute(new Broadcast({ sessid: instance.sessionid, eventChannel: channels[0], data: { liveArray: { command: 'bootstrap', context: channels[0], name: '3594' } } }))
        expect(Connection.mockSend).toHaveBeenNthCalledWith(2, broadcast)
        expectChannelsToHaveBeenQueued(true)
      })
    })

    describe('Part', () => {
      const pvtData = JSON.parse(`{"callID":"${callID}","action":"conference-liveArray-part","laChannel":"${channels[0]}","laName":"3594","role":"moderator","chatID":"conf+3594@cantina.freeswitch.org","conferenceMemberID":"455","canvasCount":1,"modChannel":"${channels[3]}","chatChannel":"${channels[1]}","infoChannel":"${channels[2]}"}`)

      it('should dispatch a ConferenceUpdate leave notification', () => {
        call.conference.part(pvtData)
        expect(onNotification).toBeCalledWith({ type: Notification.ConferenceUpdate, action: ConferenceAction.Leave, call, conferenceName: '3594', participantId: '455', role: 'moderator' })
      })
    })

    describe('destroy', () => {
      const pvtData = JSON.parse(`{"callID":"${callID}","action":"conference-liveArray-part","laChannel":"${channels[0]}","laName":"3594","role":"moderator","chatID":"conf+3594@cantina.freeswitch.org","conferenceMemberID":"455","canvasCount":1,"modChannel":"${channels[3]}","chatChannel":"${channels[1]}","infoChannel":"${channels[2]}"}`)

      it('should execute the verto.unsubscribe with all channels and remove callbacks from the queue', async () => {
        Connection.mockResponse
          .mockImplementationOnce(() => JSON.parse(`{"jsonrpc":"2.0","id":77,"result":{"subscribedChannels":${JSON.stringify(channels)},"sessid":"sessid-xyz"}}`))
          .mockImplementationOnce(() => JSON.parse(`{"jsonrpc":"2.0","id":77,"result":{"unsubscribedChannels":${JSON.stringify(channels)},"sessid":"sessid-xyz"}}`))
        await call.conference.join(pvtData)
        expectChannelsToHaveBeenQueued(true)
        Connection.mockSend.mockClear()

        await call.conference.destroy()
        const unsubscribe = instance._wrapInExecute(new Unsubscribe({ sessid: instance.sessionid, eventChannel: channels }))
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, unsubscribe)
        expectChannelsToHaveBeenQueued(false)
      })
    })

    describe('moderator commands', () => {
      const pvtData = JSON.parse(`{"callID":"${callID}","action":"conference-liveArray-join","laChannel":"${channels[0]}","laName":"3594","role":"moderator","chatID":"conf+3594@cantina.freeswitch.org","conferenceMemberID":"455","canvasCount":1,"modChannel":"${channels[3]}","chatChannel":"${channels[1]}","infoChannel":"${channels[2]}"}`)
      beforeEach(() => {
        // @ts-ignore
        call.conference.pvtData = pvtData
      })

      const _buildBroadcast = (data: any) => {
        const params = { sessid: instance.sessionid, eventChannel: channels[3], data: { application: 'conf-control', callID, ...data } }
        return instance._wrapInExecute(new Broadcast(params))
      }

      it('should respond to listVideoLayouts method', () => {
        call.conference.listVideoLayouts()
        const msg = _buildBroadcast({ command: 'list-videoLayouts' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to playMedia method', () => {
        call.conference.playMedia('media.mp4')
        const msg = _buildBroadcast({ command: 'play', value: 'media.mp4',  })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to stopMedia method', () => {
        call.conference.stopMedia()
        const msg = _buildBroadcast({ command: 'stop', value: 'all',  })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to deaf method', () => {
        call.conference.deaf('789')
        const msg = _buildBroadcast({ command: 'deaf', id: '789' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to undeaf method', () => {
        call.conference.undeaf('789')
        const msg = _buildBroadcast({ command: 'undeaf', id: '789' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to startRecord method', () => {
        call.conference.startRecord('rec.mp4')
        const msg = _buildBroadcast({ command: 'recording', value: ['start', 'rec.mp4'] })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to stopRecord method', () => {
        call.conference.stopRecord()
        const msg = _buildBroadcast({ command: 'recording', value: ['stop', 'all'] })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to snapshot method', () => {
        call.conference.snapshot('snapshot.jpg')
        const msg = _buildBroadcast({ command: 'vid-write-png', value: 'snapshot.jpg' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to setVideoLayout method', () => {
        call.conference.setVideoLayout('layout', 123)
        const msg = _buildBroadcast({ command: 'vid-layout', value: ['layout', 123] })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to kick method', () => {
        call.conference.kick('789')
        const msg = _buildBroadcast({ command: 'kick', id: '789' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to muteAudio method', () => {
        call.conference.muteAudio('789')
        const msg = _buildBroadcast({ command: 'mute', id: '789' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to unmuteAudio method', () => {
        call.conference.unmuteAudio('789')
        const msg = _buildBroadcast({ command: 'unmute', id: '789' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to toggleAudioMute method', () => {
        call.conference.toggleAudioMute('789')
        const msg = _buildBroadcast({ command: 'tmute', id: '789' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to muteVideo method', () => {
        call.conference.muteVideo('789')
        const msg = _buildBroadcast({ command: 'vmute', id: '789' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to unmuteVideo method', () => {
        call.conference.unmuteVideo('789')
        const msg = _buildBroadcast({ command: 'unvmute', id: '789' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to toggleVideoMute method', () => {
        call.conference.toggleVideoMute('789')
        const msg = _buildBroadcast({ command: 'tvmute', id: '789' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to presenter method', () => {
        call.conference.presenter('789')
        const msg = _buildBroadcast({ command: 'vid-res-id', id: '789', value: 'presenter' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to videoFloor method', () => {
        call.conference.videoFloor('789')
        const msg = _buildBroadcast({ command: 'vid-floor', id: '789', value: 'force' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to banner method', () => {
        const text = 'Banner Text'
        call.conference.banner(text)
        const msg = _buildBroadcast({ command: 'vid-banner', id: '455', value: encodeURI(text) })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to volumeDown method', () => {
        call.conference.volumeDown('789')
        const msg = _buildBroadcast({ command: 'volume_out', id: '789', value: 'down' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to volumeUp method', () => {
        call.conference.volumeUp('789')
        const msg = _buildBroadcast({ command: 'volume_out', id: '789', value: 'up' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to gainDown method', () => {
        call.conference.gainDown('789')
        const msg = _buildBroadcast({ command: 'volume_in', id: '789', value: 'down' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to gainUp method', () => {
        call.conference.gainUp('789')
        const msg = _buildBroadcast({ command: 'volume_in', id: '789', value: 'up' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })

      it('should respond to transfer method', () => {
        call.conference.transfer('3595', '789')
        const msg = _buildBroadcast({ command: 'transfer', id: '789', value: '3595' })
        expect(Connection.mockSend).toHaveBeenNthCalledWith(1, msg)
      })


      it('should dispatch a ConferenceUpdate leave notification', () => {
        call.conference.part(pvtData)
        expect(onNotification).toBeCalledWith({ type: Notification.ConferenceUpdate, action: ConferenceAction.Leave, call, conferenceName: '3594', participantId: '455', role: 'moderator' })
      })
    })

    describe('with pvtData already set', () => {
      const pvtData = JSON.parse(`{"callID":"${callID}","action":"conference-liveArray-join","laChannel":"${channels[0]}","laName":"3594","role":"moderator","chatID":"conf+3594@cantina.freeswitch.org","conferenceMemberID":"455","canvasCount":1,"modChannel":"${channels[3]}","chatChannel":"${channels[1]}","infoChannel":"${channels[2]}"}`)
      beforeEach(() => {
        // @ts-ignore
        call.conference.pvtData = pvtData
      })

      describe('updateLayouts', () => {
        it('should set canvasInfo and dispatch a notification', () => {
          const eventData = JSON.parse(`{"contentType":"layout-info","canvasType":"mcu-personal-canvas","callID":"${callID}","canvasInfo":{"canvasID":-1,"totalLayers":1,"layersUsed":1,"layoutFloorID":0,"layoutName":"1x1","canvasLayouts":[{"x":0,"y":0,"scale":360,"hscale":360,"zoom":0,"border":0,"floor":1,"overlap":0,"screenWidth":1280,"screenHeight":720,"xPOS":0,"yPOS":0,"audioPOS":"0.000000:0.0:1.000000","memberID":116}],"scale":360}}`)
          call.conference.updateLayouts(eventData)
          expect(call.conference.canvasType).toEqual('mcu-personal-canvas')
          const participant = call.conference.currentParticipant
          expect(onNotification).toBeCalledWith({ type: Notification.ConferenceUpdate, action: ConferenceAction.LayoutInfo, call, participant, canvasInfo: mutateCanvasInfoData(eventData.canvasInfo) })
        })

        it('should set participantLayerIndex if present', () => {
          const eventData = JSON.parse(`{"contentType":"layer-info","currentLayerIdx":3,"canvasType":"mcu-canvas","callID":"${callID}","canvasInfo":{"canvasID":0,"totalLayers":4,"layersUsed":4,"layoutFloorID":-1,"layoutName":"2x2","canvasLayouts":[{"x":0,"y":0,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPOS":0,"yPOS":0,"audioPOS":"-1.000000:0.0:0.500000","memberID":121},{"x":180,"y":0,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPOS":640,"yPOS":0,"audioPOS":"0.500000:0.0:0.500000","memberID":116},{"x":0,"y":180,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPOS":0,"yPOS":360,"audioPOS":"-1.000000:0.0:-1.000000","memberID":107},{"x":180,"y":180,"scale":180,"hscale":180,"zoom":0,"border":0,"floor":0,"overlap":0,"screenWidth":640,"screenHeight":360,"xPOS":640,"yPOS":360,"audioPOS":"0.500000:0.0:-1.000000","memberID":104}],"scale":360}}`)
          call.conference.updateLayouts(eventData)
          expect(call.conference.canvasType).toEqual('mcu-canvas')
          expect(call.conference.participantLayerIndex).toEqual(3)
          const participant = call.conference.currentParticipant
          expect(onNotification).toBeCalledWith({ type: Notification.ConferenceUpdate, action: ConferenceAction.LayoutInfo, call, participant, canvasInfo: mutateCanvasInfoData(eventData.canvasInfo) })
        })
      })

      describe('updateLogo', () => {
        it('should set the extension on the Call', () => {
          call.conference.updateLogo({ logoURL: 'logo' })
          expect(call.conference.participantLogo).toEqual('logo')
          expect(onNotification).toBeCalledWith({ type: Notification.ConferenceUpdate, action: ConferenceAction.LogoInfo, call, logo: 'logo' })
        })
      })

    })
  })
}
