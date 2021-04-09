import logger from '../util/logger'
import VertoHandler, { ConferencingHandler } from '../webrtc/VertoHandler'

export default (session: any, broadcastParams: any): void => {
  const { protocol, event, params } = broadcastParams
  const { event_type, node_id } = params

  if (protocol !== session.relayProtocol) {
    return logger.error('Session protocol mismatch.')
  }

  switch (event) {
    case 'queuing.relay.events':
      if (event_type === 'webrtc.message') {
        params.params.nodeId = node_id
        VertoHandler(session, params.params)
      } else {
        session.calling.notificationHandler(params)
      }
      break
    case 'conference':
      // params.params.nodeId = node_id
      return ConferencingHandler(session, params)
    case 'queuing.relay.tasks':
      session.tasking.notificationHandler(params)
      break
    case 'queuing.relay.messaging':
      session.messaging.notificationHandler(params)
      break
    default:
      return logger.error(`Unknown notification type: ${event_type}`)
  }
}
