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
  md5: string
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
  chatChannel: string
  recording: false
  preview: string
}

const _buildConference = (conference: ConferenceListRoom) => {
  return {
    uuid: conference.uuid,
    md5: conference.md5,
    running: true,
    laChannel: conference.liveArrayChannel,
    infoChannel: conference.infoChannel,
    // FIXME: remove this hack
    chatChannel: conference.chatChannel,
    modChannel: conference.modChannel,
    confName: conference.displayName,
    numMembers: conference.member_count || 0,
    isPrivate: false,
    // flags
    recording: Boolean(conference.recording),
    // variables
    lastSnapshot: conference.lastSnapshot,
  }
}

export default function (session: BrowserSession, { eventChannel, eventSerno, data: packet }: any) {
  try {
    switch (packet.action) {
      case 'bootObj': {
        console.debug('conferenceList BOOT', packet)
        session.conferences = {}
        const conferences = []
        for (const i in packet.data) {
          const conference = packet.data[i][1]
          const confInfo = _buildConference(conference)
          session.conferences[conference.uuid] = new Conference(session, confInfo)
          conferences.push(conference)
        }
        const notification = { type: Notification.ConferenceListBootstrap, conferences }
        trigger(SwEvent.Notification, notification, session.uuid)
        break
      }
      case 'add': {
        console.debug('conferenceList ADD', packet)
        const conference = packet.data
        const confInfo = _buildConference(conference)
        session.conferences[conference.uuid] = new Conference(session, confInfo)
        const notification = { type: Notification.ConferenceListAdd, conference }
        trigger(SwEvent.Notification, notification, session.uuid)
        break
      }
      case 'modify': {
        console.debug('conferenceList MODIFY', packet)
        const conference = packet.data
        const confInfo = _buildConference(conference)
        session.conferences[conference.uuid] = new Conference(session, confInfo)
        const notification = { type: Notification.ConferenceListModify, conference }
        trigger(SwEvent.Notification, notification, session.uuid)
        break
      }
      case 'del': {
        console.debug('conferenceList DEL', packet)
        const conference = packet.data
        delete session.conferences[conference.uuid]
        const notification = { type: Notification.ConferenceListDelete, conference }
        trigger(SwEvent.Notification, notification, session.uuid)
        break
      }
      default:
        console.warn('ConferenceList unknown action', packet.action, packet)
        break
    }
  } catch (error) {
    console.warn('ConferenceList error', error, packet)
  }
}

export const publicConferenceListMethods = {
  // NB: "this" refers to a special object to pass channel and params.
  // See WebRTCCall conferenceJoinHandler method
  conferenceListBootstrap: function() {
    const { session, nodeId, channel } = this
    const data = { liveArray: { command: 'bootstrap', context: channel, name: 'conferences' } }
    session.vertoBroadcast({ nodeId, channel, data })
  }
}
