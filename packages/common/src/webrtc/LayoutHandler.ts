import logger from '../util/logger'
import BrowserSession from '../BrowserSession'
import Call from './Call'
import { checkSubscribeResponse } from './helpers'
import { Result } from '../messages/Verto'
import { SwEvent, VertoMethod, NOTIFICATION_TYPE } from '../util/constants'
import { trigger, deRegister } from '../services/Handler'
import { State, ConferenceAction } from '../util/constants/call'

const MCULayoutEventHandler = (eventData: any, privateEvent: boolean = false) => {
  const { } = eventData
  if (privateEvent) {

  } else {

  }
}


export {
  MCULayoutEventHandler
}
