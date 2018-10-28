import Session from '../Session'
import { Setup } from './Setup'
import { Execute } from '../blade/Blade'
import { cleanNumber } from '../util/helpers'

const SERVICE = 'messaging'

const sendMessage = async (session: Session, params: { body: string, from: string, to: string, media: string[] }) => {
  await Setup(session, SERVICE)

  const { body, from, to, media } = params
  const msg = new Execute({
    protocol: session.services[SERVICE],
    method: 'send',
    params: {
      message: { body, from: cleanNumber(from), to: cleanNumber(to), media: media || [] }
    }
  })

  return session.execute(msg)
}

const getMessage = async (session: Session, id: string) => {
  await Setup(session, SERVICE)

  const msg = new Execute({
    protocol: session.services[SERVICE],
    method: 'status',
    params: { id }
  })

  return session.execute(msg)
}

export {
  SERVICE as service,
  sendMessage,
  getMessage
}
