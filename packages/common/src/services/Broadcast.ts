import { trigger } from './Handler'

export const BroadcastHandler = (params: any) => {
  const { protocol, event, channel, params: subParams } = params

  const triggered = trigger(protocol, subParams, channel, false)
  if (!triggered) {
    console.log('BroadcastHandler did not trigger.', protocol, event, channel, subParams)
  }
}
