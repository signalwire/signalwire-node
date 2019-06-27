import BaseCall from './BaseCall'
import { State } from '../util/constants/call'

export default class Call extends BaseCall {

  switchCamera() {

  }

  deaf() {

  }

  undeaf() {

  }

  speakerphone() {

  }

  setState(state: State) {
    super.setState(state)

    // TODO: react-native-incall-manager handling
    switch (state) {
      case State.Active:
        break
      case State.Destroy:
        break
    }
  }
}
