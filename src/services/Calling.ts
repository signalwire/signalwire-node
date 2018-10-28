import Session from '../Session'
import { Setup } from './Setup'
import { Execute } from '../blade/Blade'
import { cleanNumber } from '../util/helpers'

const SERVICE = 'calling'

const newCall = async (session: Session, params: { from: string, to: string }) => {
  await Setup(session, SERVICE)

  const { from, to } = params
  const msg = new Execute({
    protocol: session.services[SERVICE],
    method: 'call',
    params: { from: cleanNumber(from), to: cleanNumber(to), retries: 5, sleep_between_retries: 10000 }
  })
  return session.execute(msg)
}

const play = async (session: Session, params: { callId: string, url: string }) => {
  await Setup(session, SERVICE)

  const { callId: channel, url } = params
  const msg = new Execute({
    protocol: session.services[SERVICE],
    method: 'play',
    params: { channel, url }
  })
  return session.execute(msg)
}

const sendDtmf = async (session: Session, params: { callId: string, digits: string, digit_duration: number }) => {
  await Setup(session, SERVICE)

  const { callId: channel, digits, digit_duration = 80 } = params
  const msg = new Execute({
    protocol: session.services[SERVICE],
    method: 'play_digits',
    params: { channel, digits, digit_duration }
  })
  return session.execute(msg)
}

const say = async (session: Session, params: { callId: string, what: string, gender: string }) => {
  await Setup(session, SERVICE)

  const { callId: channel, what: what, gender = 'other' } = params
  const msg = new Execute({
    protocol: session.services[SERVICE],
    method: 'say',
    params: { channel, what, gender }
  })
  return session.execute(msg)
}

const hangup = async (session: Session, params: { callId: string }) => {
  await Setup(session, SERVICE)

  const { callId: channel } = params
  const msg = new Execute({ protocol: session.services[SERVICE], method: 'disconnect', params: { channel } })
  return session.execute(msg)
}

const answer = async (session: Session, params: { callId: string }) => {
  await Setup(session, SERVICE)

  const { callId: channel } = params
  const msg = new Execute({ protocol: session.services[SERVICE], method: 'answer', params: { channel } })
  return session.execute(msg)
}

const collectDigits = async (session: Session, params: { callId: string }) => {
  await Setup(session, SERVICE)

  const { callId: channel } = params
  const msg = new Execute({ protocol: session.services[SERVICE], method: 'collect_digits', params: { channel } })
  return session.execute(msg)
}

const collectSpeech = async (session: Session, params: { callId: string }) => {
  await Setup(session, SERVICE)

  const { callId: channel } = params
  const msg = new Execute({ protocol: session.services[SERVICE], method: 'collect_speech', params: { channel } })
  return session.execute(msg)
}

export {
  SERVICE as service,
  newCall,
  play,
  sendDtmf,
  say,
  hangup,
  answer,
  collectDigits,
  collectSpeech
}
