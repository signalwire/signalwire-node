// import { mutateLiveArrayData } from '../util/helpers'
import { trigger } from '../services/Handler'
import { SwEvent } from '../util/constants'
import BrowserSession from '../BrowserSession'
import { Notification } from './constants'
import Conference from './Conference'

interface ConferenceListHandlerParams {
  data: {
    action: 'add' | 'modify' | 'del'
    data: ConferenceListRoom
  }
  eventChannel: 'conference-list'
  eventSerno: number
  subscribedChannel: 'conference-list'
}

interface ConferenceListRoom {
  uuid: string
  displayName: string
  name: string
  member_count: number
  members: {
    id: number
    uuid: string
    email: string
    name: string
  }[]
  lastSnapshot: string
  liveArrayChannel: string
  infoChannel: string
  modChannel: string
  recording: false
  preview: string
}

export default function (session: BrowserSession, { eventChannel, eventSerno, data: packet }: any) {
  const { data: conference } = packet
  const confInfo = {
    uuid: conference.uuid,
    running: true,
    laChannel: conference.liveArrayChannel,
    infoChannel: conference.infoChannel,
    // FIXME: remove this hack
    chatChannel: conference.liveArrayChannel.replace('liveArray', 'chat'),
    modChannel: conference.modChannel,
    confName: conference.displayName,
    numMembers: conference.member_count || 0,
    isPrivate: false,
    // flags
    recording: Boolean(conference.recording),
    // variables
    lastSnapshot: conference.lastSnapshot,
  }
  switch (packet.action) {
    case 'add': {
      console.debug('conferenceList ADD', packet)
      this.conferences[conference.uuid] = new Conference(this, confInfo)
      const notification = { type: Notification.ConferenceListAdd, conference }
      trigger(SwEvent.Notification, notification, this.uuid)
      break
    }
    case 'modify': {
      console.debug('conferenceList MODIFY', packet)
      this.conferences[conference.uuid] = new Conference(this, confInfo)
      const notification = { type: Notification.ConferenceListModify, conference }
      trigger(SwEvent.Notification, notification, this.uuid)
      break
    }
    case 'del': {
      console.debug('conferenceList DEL', packet)
      delete this.conferences[conference.uuid]
      const notification = { type: Notification.ConferenceListDelete, conference }
      trigger(SwEvent.Notification, notification, this.uuid)
      break
    }
    default:
      console.warn('ConferenceList unknown action', packet.action, packet)
      break
  }
}

export const publicConferenceListMethods = {
  // NB: "this" refers to a special object to pass channel and params.
  // See WebRTCCall conferenceJoinHandler method
  conferenceListBootstrap: function() {
    const { session, nodeId, channel, name } = this
    const data = { liveArray: { command: 'bootstrap', context: channel, name } }
    session.vertoBroadcast({ nodeId, channel, data })
  }
}
